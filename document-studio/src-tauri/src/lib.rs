use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::Manager;
use tokio::sync::oneshot;

const OLLAMA_BASE: &str = "http://127.0.0.1:11434";
const OLLAMA_MODEL: &str = "qwen2.5:3b";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SimpleAiStatus {
    connected: bool,
    model_available: bool,
    model: &'static str,
    message: String,
}

#[derive(Clone, Deserialize, Serialize)]
struct SimpleChatMessage {
    role: String,
    content: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SimpleChatRequest {
    request_id: String,
    messages: Vec<SimpleChatMessage>,
    timeout_seconds: Option<u64>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct SimpleChatResponse {
    request_id: String,
    content: String,
    duration_ms: u64,
}

#[derive(Default)]
struct SimpleAiRuntime {
    active: Mutex<HashMap<String, oneshot::Sender<()>>>,
}

fn ollama_client(timeout_seconds: u64) -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .connect_timeout(Duration::from_secs(3))
        .timeout(Duration::from_secs(timeout_seconds))
        .build()
        .map_err(|error| error.to_string())
}

#[tauri::command]
async fn simple_ai_status() -> Result<SimpleAiStatus, String> {
    let client = ollama_client(8)?;
    let response = match client.get(format!("{OLLAMA_BASE}/api/tags")).send().await {
        Ok(response) => response,
        Err(_) => {
            return Ok(SimpleAiStatus {
                connected: false,
                model_available: false,
                model: OLLAMA_MODEL,
                message: "De lokale AI is niet bereikbaar. Controleer of Ollama actief is.".into(),
            })
        }
    };
    let body: Value = response
        .json()
        .await
        .map_err(|_| "Ollama gaf een ongeldige status terug.".to_string())?;
    let available = body["models"].as_array().is_some_and(|models| {
        models.iter().any(|model| {
            model["name"].as_str() == Some(OLLAMA_MODEL)
                || model["model"].as_str() == Some(OLLAMA_MODEL)
        })
    });
    Ok(SimpleAiStatus {
        connected: true,
        model_available: available,
        model: OLLAMA_MODEL,
        message: if available {
            "Verbonden met Ollama; qwen2.5:3b is beschikbaar.".into()
        } else {
            "Ollama is bereikbaar, maar qwen2.5:3b is niet geïnstalleerd.".into()
        },
    })
}

fn validate_chat_request(request: &SimpleChatRequest) -> Result<(), String> {
    if request.request_id.trim().is_empty() {
        return Err("Het AI-verzoek heeft geen geldig nummer.".into());
    }
    let Some(last) = request.messages.last() else {
        return Err("Typ eerst een bericht.".into());
    };
    if last.role != "user" || last.content.trim().is_empty() {
        return Err("Het laatste chatbericht moet een ingevuld gebruikersbericht zijn.".into());
    }
    if request.messages.iter().any(|message| {
        !matches!(message.role.as_str(), "user" | "assistant")
            || message.content.chars().count() > 4_000
    }) {
        return Err("Een chatbericht heeft een ongeldig formaat of is te lang.".into());
    }
    let total_characters: usize = request
        .messages
        .iter()
        .map(|message| message.content.chars().count())
        .sum();
    if total_characters > 12_000 {
        return Err("Het gesprek is te lang. Start een nieuw gesprek en probeer opnieuw.".into());
    }
    Ok(())
}

async fn perform_simple_chat(request: &SimpleChatRequest) -> Result<(String, u64), String> {
    validate_chat_request(request)?;
    let timeout = request.timeout_seconds.unwrap_or(60).clamp(15, 60);
    let client = ollama_client(timeout)?;
    let mut messages = vec![json!({
        "role": "system",
        "content": "Je bent de lokale assistent van Technisch Bouwadvies. Beantwoord gewone vragen helder, beknopt en in het Nederlands. Verzin geen feiten. In deze fase wijzig je geen formulieren, offertes, facturen of documenten. Antwoord uitsluitend als normale tekst."
    })];
    let start = request.messages.len().saturating_sub(12);
    messages.extend(request.messages[start..].iter().filter_map(|message| {
        let content = message.content.trim();
        (!content.is_empty()).then(|| json!({"role": message.role, "content": content}))
    }));

    let body = json!({
        "model": OLLAMA_MODEL,
        "stream": false,
        "keep_alive": "10m",
        "messages": messages,
        "options": {
            "temperature": 0.2,
            "top_p": 0.8,
            "num_ctx": 2048,
            "num_predict": 220
        }
    });
    let started = Instant::now();
    let response = client
        .post(format!("{OLLAMA_BASE}/api/chat"))
        .json(&body)
        .send()
        .await
        .map_err(|error| {
            if error.is_timeout() {
                format!("TIMEOUT:{timeout}")
            } else {
                "De lokale AI is niet bereikbaar. Controleer of Ollama actief is.".to_string()
            }
        })?;
    let duration_ms = started.elapsed().as_millis() as u64;
    if !response.status().is_success() {
        return Err(format!(
            "Ollama gaf een foutmelding ({}).",
            response.status()
        ));
    }
    let result: Value = response
        .json()
        .await
        .map_err(|_| "Ollama gaf een ongeldig antwoord terug.".to_string())?;
    let content = result["message"]["content"]
        .as_str()
        .map(str::trim)
        .filter(|content| !content.is_empty())
        .ok_or_else(|| "Ollama gaf geen bruikbaar tekstantwoord terug.".to_string())?;
    Ok((content.to_string(), duration_ms))
}

fn write_ai_log(app: &tauri::AppHandle, event: Value) {
    let Ok(dir) = app.path().app_data_dir() else {
        return;
    };
    if fs::create_dir_all(&dir).is_err() {
        return;
    }
    let path = dir.join("ai-diagnostics.jsonl");
    if path
        .metadata()
        .map(|meta| meta.len() > 1_000_000)
        .unwrap_or(false)
    {
        let _ = fs::write(&path, "");
    }
    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
        let _ = writeln!(
            file,
            "{}",
            json!({"timestamp": chrono::Utc::now().to_rfc3339(), "data": event})
        );
    }
}

#[tauri::command]
async fn simple_ai_chat(
    app: tauri::AppHandle,
    runtime: tauri::State<'_, SimpleAiRuntime>,
    request: SimpleChatRequest,
) -> Result<SimpleChatResponse, String> {
    validate_chat_request(&request)?;
    let (cancel_tx, cancel_rx) = oneshot::channel();
    {
        let mut active = runtime
            .active
            .lock()
            .map_err(|_| "AI-status is niet beschikbaar.")?;
        if !active.is_empty() {
            return Err("Er wordt al een AI-bericht verwerkt. Wacht of annuleer dat eerst.".into());
        }
        active.insert(request.request_id.clone(), cancel_tx);
    }

    let started = Instant::now();
    let outcome = tokio::select! {
        result = perform_simple_chat(&request) => result,
        _ = cancel_rx => Err("CANCELLED".to_string()),
    };
    if let Ok(mut active) = runtime.active.lock() {
        active.remove(&request.request_id);
    }
    let total_ms = started.elapsed().as_millis() as u64;

    match outcome {
        Ok((content, duration_ms)) => {
            write_ai_log(
                &app,
                json!({
                    "event": "simple_chat_success",
                    "requestId": request.request_id,
                    "totalMs": total_ms
                }),
            );
            Ok(SimpleChatResponse {
                request_id: request.request_id,
                content,
                duration_ms,
            })
        }
        Err(error) if error == "CANCELLED" => {
            write_ai_log(
                &app,
                json!({
                    "event": "simple_chat_cancelled",
                    "requestId": request.request_id,
                    "totalMs": total_ms
                }),
            );
            Err("Het AI-bericht is geannuleerd.".into())
        }
        Err(error) if error.starts_with("TIMEOUT:") => {
            write_ai_log(
                &app,
                json!({
                    "event": "simple_chat_timeout",
                    "requestId": request.request_id,
                    "totalMs": total_ms
                }),
            );
            Err("De lokale AI antwoordde niet binnen 60 seconden. Probeer het opnieuw.".into())
        }
        Err(error) => {
            write_ai_log(
                &app,
                json!({
                    "event": "simple_chat_error",
                    "requestId": request.request_id,
                    "totalMs": total_ms,
                    "message": error
                }),
            );
            Err(error)
        }
    }
}

#[tauri::command]
fn simple_ai_cancel(
    runtime: tauri::State<'_, SimpleAiRuntime>,
    request_id: String,
) -> Result<bool, String> {
    let sender = runtime
        .active
        .lock()
        .map_err(|_| "AI-status is niet beschikbaar.")?
        .remove(&request_id);
    Ok(sender.is_some_and(|sender| sender.send(()).is_ok()))
}

fn db_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("document-studio.sqlite3"))
}

fn connection(app: &tauri::AppHandle) -> Result<Connection, String> {
    let conn = Connection::open(db_path(app)?).map_err(|e| e.to_string())?;
    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id=1), json TEXT NOT NULL, updated_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS backups (id INTEGER PRIMARY KEY AUTOINCREMENT, json TEXT NOT NULL, created_at TEXT NOT NULL);").map_err(|e| e.to_string())?;
    Ok(conn)
}

#[tauri::command]
fn load_state(app: tauri::AppHandle) -> Result<String, String> {
    let conn = connection(&app)?;
    conn.query_row("SELECT json FROM app_state WHERE id=1", [], |row| {
        row.get(0)
    })
    .or_else(|e| {
        if e == rusqlite::Error::QueryReturnedNoRows {
            Ok(String::new())
        } else {
            Err(e)
        }
    })
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn save_state(app: tauri::AppHandle, json: String) -> Result<(), String> {
    let mut conn = connection(&app)?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;
    let previous: Option<String> = tx
        .query_row("SELECT json FROM app_state WHERE id=1", [], |r| r.get(0))
        .ok();
    if let Some(old) = previous {
        tx.execute(
            "INSERT INTO backups(json,created_at) VALUES(?1,datetime('now'))",
            params![old],
        )
        .map_err(|e| e.to_string())?;
        tx.execute("DELETE FROM backups WHERE id NOT IN (SELECT id FROM backups ORDER BY id DESC LIMIT 25)", [])
            .map_err(|e| e.to_string())?;
    }
    tx.execute("INSERT INTO app_state(id,json,updated_at) VALUES(1,?1,datetime('now')) ON CONFLICT(id) DO UPDATE SET json=excluded.json,updated_at=excluded.updated_at", params![json])
        .map_err(|e| e.to_string())?;
    tx.commit().map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SimpleAiRuntime::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            load_state,
            save_state,
            simple_ai_status,
            simple_ai_chat,
            simple_ai_cancel
        ])
        .run(tauri::generate_context!())
        .expect("error while running Document Studio");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn request(messages: Vec<SimpleChatMessage>) -> SimpleChatRequest {
        SimpleChatRequest {
            request_id: "test-request".into(),
            messages,
            timeout_seconds: Some(60),
        }
    }

    #[test]
    fn accepts_only_a_normal_user_message_as_last_message() {
        let valid = request(vec![SimpleChatMessage {
            role: "user".into(),
            content: "Waarmee kun je me helpen?".into(),
        }]);
        assert!(validate_chat_request(&valid).is_ok());

        let invalid = request(vec![SimpleChatMessage {
            role: "assistant".into(),
            content: "Antwoord".into(),
        }]);
        assert!(validate_chat_request(&invalid).is_err());
    }

    #[tokio::test]
    #[ignore = "requires the local qwen2.5:3b Ollama model"]
    async fn real_ollama_handles_two_consecutive_chat_turns() {
        let first = request(vec![SimpleChatMessage {
            role: "user".into(),
            content: "Antwoord kort: waarmee kun je helpen?".into(),
        }]);
        let (first_answer, _) = perform_simple_chat(&first).await.unwrap();
        assert!(!first_answer.trim().is_empty());

        let second = request(vec![
            SimpleChatMessage {
                role: "user".into(),
                content: "Antwoord kort: waarmee kun je helpen?".into(),
            },
            SimpleChatMessage {
                role: "assistant".into(),
                content: first_answer,
            },
            SimpleChatMessage {
                role: "user".into(),
                content: "Noem één voorbeeld in één zin.".into(),
            },
        ]);
        let (second_answer, _) = perform_simple_chat(&second).await.unwrap();
        assert!(!second_answer.trim().is_empty());
    }

    #[tokio::test]
    async fn cancellation_signal_interrupts_wait() {
        let (sender, receiver) = oneshot::channel::<()>();
        sender.send(()).unwrap();
        let cancelled = tokio::select! {
            _ = receiver => true,
            _ = tokio::time::sleep(Duration::from_secs(2)) => false,
        };
        assert!(cancelled);
    }
}
