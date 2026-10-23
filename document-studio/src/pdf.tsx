import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  pdf,
} from "@react-pdf/renderer";
import type { CompanySettings, DocumentRecord } from "./types";
import { downloadBlob } from "./storage";
import { formatAlkaAddress } from "./alkaAddress";
import { parseNumericInput } from "./domain";
Font.register({
  family: "Montserrat",
  fonts: [
    { src: "/assets/Montserrat-Regular.woff" },
    { src: "/assets/Montserrat-SemiBold.woff", fontWeight: 600 },
    { src: "/assets/Montserrat-Bold.woff", fontWeight: 700 },
  ],
});
const euro = (n: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(
    n,
  );
const date = (s: string) =>
  s ? new Intl.DateTimeFormat("nl-NL").format(new Date(`${s}T12:00:00`)) : "";
const common = StyleSheet.create({
  page: { padding: 50, fontFamily: "Helvetica", fontSize: 9, color: "#26364a" },
  row: { flexDirection: "row" },
  grow: { flexGrow: 1 },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 50,
    right: 50,
    flexDirection: "row",
    fontSize: 8,
    color: "#5a6b86",
  },
  tableHead: {
    flexDirection: "row",
    fontWeight: 700,
    borderBottom: "1 solid #d7dce2",
    paddingBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #edf0f2",
    paddingVertical: 7,
  },
  desc: { width: "52%" },
  qty: { width: "14%", textAlign: "right" },
  price: { width: "17%", textAlign: "right" },
  amount: { width: "17%", textAlign: "right" },
});
const Footer = ({ doc }: { doc: DocumentRecord }) => (
  <View style={common.footer} fixed>
    <Text>
      {doc.type === "factuur" ? "Factuur" : "Offerte"} |{" "}
      {doc.companyId === "alka" ? "ALKA Visuals" : "Technisch Bouwadvies"}
    </Text>
    <Text style={common.grow} />
    <Text
      render={({ pageNumber, totalPages }) =>
        `Pagina ${pageNumber} van ${totalPages}`
      }
    />
  </View>
);
function Lines({
  doc,
  color = "#0b3540",
}: {
  doc: DocumentRecord;
  color?: string;
}) {
  const lines = doc.lines.filter((l) => l.selected);
  return (
    <View wrap>
      <View style={[common.tableHead, { color }]}>
        <Text style={common.desc}>
          {doc.companyId === "tba" ? "Werkzaamheden" : "Omschrijving"}
        </Text>
        <Text style={common.qty}>Aantal</Text>
        {doc.priceMode === "services" && (
          <>
            <Text style={common.price}>Prijs</Text>
            <Text style={common.amount}>Totaal</Text>
          </>
        )}
      </View>
      {lines.map((l) => (
        <View key={l.id} style={common.tableRow} wrap={false}>
          <Text style={common.desc}>{l.description || l.name}</Text>
          <Text style={common.qty}>{l.quantityText ?? String(l.quantity)}</Text>
          {doc.priceMode === "services" && (
            <>
              <Text style={common.price}>
                {parseNumericInput(l.unitPriceText ?? String(l.unitPrice)) ===
                null
                  ? l.unitPriceText
                  : euro(l.unitPrice)}
              </Text>
              <Text style={common.amount}>
                {parseNumericInput(l.quantityText ?? String(l.quantity)) !==
                  null &&
                parseNumericInput(l.unitPriceText ?? String(l.unitPrice)) !==
                  null
                  ? euro(l.quantity * l.unitPrice)
                  : "—"}
              </Text>
            </>
          )}
        </View>
      ))}
    </View>
  );
}
function TbaParagraphs({
  text,
  marginBottom = 0,
  italic = false,
}: {
  text: string;
  marginBottom?: number;
  italic?: boolean;
}) {
  const paragraphs = (text || "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  return (
    <View style={{ marginBottom }}>
      {paragraphs.map((paragraph, index) => (
        <Text
          key={`${paragraph.slice(0, 24)}-${index}`}
          style={{
            lineHeight: 0.85,
            fontStyle: italic ? "italic" : "normal",
            marginBottom: index < paragraphs.length - 1 ? 7 : 0,
          }}
        >
          {paragraph}
        </Text>
      ))}
    </View>
  );
}
function Totals({ doc }: { doc: DocumentRecord }) {
  return (
    <View style={{ marginTop: 14, marginLeft: "58%" }} wrap={false}>
      <View style={[common.row, { marginBottom: 6 }]}>
        <Text style={common.grow}>Subtotaal</Text>
        <Text>{euro(doc.subtotal)}</Text>
      </View>
      <View style={[common.row, { marginBottom: 8 }]}>
        <Text style={common.grow}>Btw ({doc.vatRate}%)</Text>
        <Text>{euro(doc.vat)}</Text>
      </View>
      <View
        style={[
          common.row,
          {
            borderTop: "1 solid #243c49",
            paddingTop: 8,
            fontWeight: 700,
            fontSize: 11,
          },
        ]}
      >
        <Text style={common.grow}>Totaal incl. btw</Text>
        <Text>{euro(doc.total)}</Text>
      </View>
    </View>
  );
}
function AlkaPdf({
  doc,
  company,
}: {
  doc: DocumentRecord;
  company: CompanySettings;
}) {
  const addressLines = formatAlkaAddress(doc.clientAddress);
  return (
    <Document title={`${doc.type} ${doc.number || "concept"}`}>
      <Page
        size="A4"
        style={{
          padding: 48,
          fontFamily: "Montserrat",
          fontSize: 9,
          color: "#263a58",
        }}
        wrap
      >
        <Image src={company.logo} style={{ width: 190, marginBottom: 58 }} />
        <View style={[common.row, { marginLeft: 180, marginBottom: 42 }]}>
          <View style={{ width: 145, paddingRight: 16, textAlign: "center" }}>
            <Text style={{ fontWeight: 700, marginBottom: 12 }}>
              {doc.type === "factuur" ? "Factuur aan" : "Offerte aan"}
            </Text>
            {doc.contact && (
              <Text style={{ marginBottom: 3 }}>t.a.v. {doc.contact}</Text>
            )}
            {doc.client && (
              <Text style={{ marginBottom: 3 }}>{doc.client}</Text>
            )}
            {addressLines.map((line, index) => (
              <Text
                key={`${line}-${index}`}
                style={
                  index < addressLines.length - 1
                    ? { marginBottom: 3 }
                    : undefined
                }
              >
                {line}
              </Text>
            ))}
            <Text style={{ marginTop: 18 }}>{date(doc.date)}</Text>
          </View>
          <View style={{ width: 160 }}>
            <Text
              style={{ fontWeight: 700, fontSize: 12.5, letterSpacing: 0.5 }}
            >
              {doc.type === "factuur" ? "FACTUURNUMMER" : "OFFERTENUMMER"}
            </Text>
            <Text style={{ fontSize: 12, marginTop: 6 }}>{doc.number}</Text>
          </View>
        </View>
        <Text style={{ fontWeight: 700, fontSize: 11, marginBottom: 7 }}>
          Project {doc.project}
        </Text>
        <View
          style={{ backgroundColor: "#06343b", padding: 11, marginBottom: 16 }}
        >
          <Text style={{ color: "white", fontWeight: 700, letterSpacing: 1 }}>
            OMSCHRIJVING
          </Text>
        </View>
        {doc.description && (
          <Text style={{ marginBottom: 16, lineHeight: 1.5 }}>
            {doc.description}
          </Text>
        )}
        <Lines doc={doc} />
        <Totals doc={doc} />
        <View
          style={[
            common.row,
            { borderTop: "1 solid #06343b", paddingTop: 12, marginTop: 18 },
          ]}
          wrap={false}
        >
          <View style={{ width: "48%", textAlign: "center" }}>
            <Text style={{ fontWeight: 700, marginBottom: 3 }}>
              {company.legalName}
            </Text>
            <Text style={{ marginBottom: 3 }}>{company.address}</Text>
            <Text style={{ marginBottom: 3 }}>{company.postalCity}</Text>
            <Text style={{ marginBottom: 3 }}>KvK: {company.kvk}</Text>
            <Text style={{ marginBottom: 3 }}>Btw-id: {company.vatId}</Text>
            <Text style={{ marginBottom: 3 }}>IBAN: {company.iban}</Text>
            <Text>T.n.v.: {company.accountHolder}</Text>
          </View>
          <View style={{ width: "52%", textAlign: "center", paddingLeft: 20 }}>
            <Text style={{ marginBottom: 3 }}>
              {company.defaultPaymentTerms}
            </Text>
            {doc.number && <Text>Vermeld: {doc.number}</Text>}
          </View>
        </View>
        <Footer doc={doc} />
      </Page>
    </Document>
  );
}
function TbaPdf({
  doc,
  company,
}: {
  doc: DocumentRecord;
  company: CompanySettings;
}) {
  const blue = "#216082";
  return (
    <Document title={`${doc.type} ${doc.number || "concept"}`}>
      <Page size="A4" style={common.page} wrap>
        <Image src={company.logo} style={{ width: 190, marginBottom: 55 }} />
        <Text
          style={{
            fontSize: 23,
            fontWeight: 700,
            color: blue,
            marginBottom: 25,
          }}
        >
          {doc.type.toUpperCase()}
        </Text>
        <View style={{ marginBottom: 28, lineHeight: 1.8 }}>
          <Text>
            <Text style={{ fontWeight: 700, color: blue }}>
              Opdrachtgever:{" "}
            </Text>
            {doc.client}
          </Text>
          <Text>
            <Text style={{ fontWeight: 700, color: blue }}>Projectadres: </Text>
            {doc.projectAddress}
          </Text>
          <Text>
            <Text style={{ fontWeight: 700, color: blue }}>
              {doc.type === "factuur" ? "Factuurnummer" : "Offertenummer"}:{" "}
            </Text>
            {doc.number || "CONCEPT"}
          </Text>
          <Text>
            <Text style={{ fontWeight: 700, color: blue }}>Datum: </Text>
            {date(doc.date)}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: blue,
            marginBottom: 12,
          }}
        >
          Omschrijving opdracht
        </Text>
        <TbaParagraphs text={doc.description} marginBottom={25} />
        <Lines doc={doc} color={blue} />
        <Totals doc={doc} />
        <Footer doc={doc} />
      </Page>
      <Page size="A4" style={common.page} wrap>
        <Text
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: blue,
            marginTop: 35,
            marginBottom: 12,
          }}
        >
          Niet inbegrepen in deze opdracht
        </Text>
        <TbaParagraphs text={doc.exclusions} />
        {doc.additionalExplanation && (
          <View style={{ marginTop: 9, marginBottom: 28 }}>
            <TbaParagraphs text={doc.additionalExplanation} italic />
          </View>
        )}
        {!doc.additionalExplanation && <View style={{ marginBottom: 28 }} />}
        <Text
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: blue,
            marginBottom: 8,
          }}
        >
          Correctierondes
        </Text>
        <TbaParagraphs text={doc.corrections} marginBottom={22} />
        {doc.additionalTerms && (
          <>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: blue,
                marginBottom: 8,
              }}
            >
              Aanvullende afspraken
            </Text>
            <Text style={{ lineHeight: 1.5, marginBottom: 22 }}>
              {doc.additionalTerms}
            </Text>
          </>
        )}
        <View style={[common.row, { marginTop: 20 }]} wrap={false}>
          <View style={{ width: "48%", paddingRight: 18 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: blue,
                marginBottom: 18,
              }}
            >
              Contactgegevens
            </Text>
            <Text style={{ fontWeight: 700, marginBottom: 10 }}>
              {company.legalName}
            </Text>
            <Text style={{ marginBottom: 3 }}>{company.address}</Text>
            <Text style={{ marginBottom: 10 }}>{company.postalCity}</Text>
            {company.phone && (
              <Text style={{ marginBottom: 3 }}>T: {company.phone}</Text>
            )}
            {company.email && (
              <Text style={{ marginBottom: 3 }}>E: {company.email}</Text>
            )}
            {company.website && (
              <Text style={{ marginBottom: 3 }}>W: {company.website}</Text>
            )}
            {company.kvk && (
              <Text style={{ marginBottom: 3 }}>KvK: {company.kvk}</Text>
            )}
            {company.vatId && (
              <Text style={{ marginBottom: 3 }}>Btw-id: {company.vatId}</Text>
            )}
            {company.iban && (
              <Text style={{ marginBottom: 3 }}>IBAN: {company.iban}</Text>
            )}
          </View>
          <View style={{ width: "52%", paddingLeft: 18 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: blue,
                marginBottom: 18,
              }}
            >
              Betalingsvoorwaarden
            </Text>
            <TbaParagraphs text={doc.paymentTerms} />
          </View>
        </View>
        <Footer doc={doc} />
      </Page>
    </Document>
  );
}
export const PdfDocument = ({
  doc,
  company,
}: {
  doc: DocumentRecord;
  company: CompanySettings;
}) =>
  doc.companyId === "alka" ? (
    <AlkaPdf doc={doc} company={company} />
  ) : (
    <TbaPdf doc={doc} company={company} />
  );
export async function makePdfBlob(
  doc: DocumentRecord,
  company: CompanySettings,
) {
  return await pdf(<PdfDocument doc={doc} company={company} />).toBlob();
}
export async function exportPdf(doc: DocumentRecord, company: CompanySettings) {
  const blob = await makePdfBlob(doc, company);
  downloadBlob(
    blob,
    `${doc.number || "concept"}-${doc.client || company.name}.pdf`,
  );
  return blob;
}
