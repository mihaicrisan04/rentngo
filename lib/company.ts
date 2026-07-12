/**
 * Canonical company identity constants for Rent'n Go.
 *
 * Single source of truth for business identity data (name, contact, address,
 * geo, socials, registration). The same data is currently still hardcoded in
 * 10+ places (JSON-LD in several layouts/pages, contact/terms/privacy copy,
 * confirmation pages, translation JSONs, convex/emails.ts) — migrating those
 * copies onto this module is tracked as RNGO-20. New code MUST import from
 * here instead of adding another copy.
 *
 * NOTE (email drift, flagged in AUDIT.md): the transfer confirmation page
 * shows `contact@rngo.ro` while everything else uses `office@rngo.ro`. This
 * module standardizes on `office@rngo.ro`; confirm with the client as part
 * of the RNGO-20 migration.
 */
export const COMPANY = {
  name: "Rent'n Go",
  alternateName: "Rent'n Go Cluj-Napoca",
  legalName: "Rent'n Go Prodexa S.R.L.",
  baseUrl: "https://rngo.ro",
  logoUrl: "https://rngo.ro/logo.png",
  email: "office@rngo.ro",
  phone: {
    /** Format used in schema.org markup */
    schema: "+40-773-932-961",
    /** Human-readable display format */
    display: "+40 773 932 961",
    /** `tel:` link format */
    tel: "+40773932961",
  },
  /** Main pickup location — Cluj "Avram Iancu" International Airport */
  address: {
    streetAddress:
      'Cluj "Avram Iancu" International Airport, Strada Traian Vuia 149-151',
    locality: "Cluj-Napoca",
    region: "Cluj",
    postalCode: "400397",
    country: "RO",
  },
  geo: {
    latitude: 46.7712,
    longitude: 23.6236,
  },
  /** Legal registration details (from the Terms & Conditions page) */
  registration: {
    registeredOffice: "Sat Florești, Strada Tăuțului nr. 214D, Jud. Cluj, Romania",
    tradeRegister: "J12/1445/2024",
    cui: "49799254",
  },
  /** 24/7 airport-based service */
  openingHours: {
    opens: "00:00",
    closes: "23:59",
  },
  priceRange: "€€",
  currenciesAccepted: "EUR, RON",
  paymentAccepted: "Cash, Credit Card",
  sameAs: [
    "https://www.facebook.com/share/1Ad82uMtP3/?mibextid=wwXIfr",
    "https://www.instagram.com/rentn_go.ro",
    "https://www.tiktok.com/@rentn.go",
  ],
} as const;
