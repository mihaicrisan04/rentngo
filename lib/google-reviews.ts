export const GOOGLE_PLACE_ID = "ChIJ9Q3JNjcPSUcRNH4ZIZMWsM8";

export const GOOGLE_REVIEWS_URL = `https://search.google.com/local/reviews?placeid=${GOOGLE_PLACE_ID}`;

export const GOOGLE_WRITE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;

/** Snapshot of the Google Business Profile; update together with the reviews below. */
export const GOOGLE_RATING = {
  score: 5,
  reviewCount: 64,
} as const;

export interface GoogleReview {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Verbatim from Google, in the language it was written in. */
  text: string;
  /** "YYYY-MM" the review was posted, when known. */
  postedAt?: string;
}

/** Hand-picked from the Google Business Profile. Never edit the wording. */
export const GOOGLE_REVIEWS: readonly GoogleReview[] = [
  {
    author: "Alexandra Curecheriu",
    rating: 5,
    text: "Sunt foarte mulțumită de serviciile oferite. Mașina a fost în stare excelentă, curată și confortabilă. Personalul a fost amabil și profesionist, iar preluarea și predarea s-au desfășurat foarte ușor. Cu siguranță voi apela din nou la această firmă și o recomand tuturor.",
  },
  {
    author: "Agnes Horvath",
    rating: 5,
    text: "I highly recommend this company! They trustworthy, professional and they go above and beyond for customer satisfaction! You don’t have to worry of hidden charges, everything is straight forward and upfront.",
  },
  {
    author: "MARIO SÁNCHEZ PESCADOR",
    rating: 5,
    text: "We highly recommend Rent’n Go services. The reservation process and communication with Tudor, the company owner, were very fast. We were very satisfied with the car we chose for the 12 days of traveling around Romania. It was well maintained and impeccable. We definitely recommend them and will certainly use this company’s services again.",
  },
  {
    author: "Seba",
    rating: 5,
    text: "Experienta excelenta de la inceput pana la sfarsit! Am inchiriat un Hyundai i20 din 2023, masina a fost intr-o stare impecabila si a mers perfect pe toata durata inchirierii. Procesul a fost rapid si foarte simplu, fara batai de cap. Tudor este un tip super profesionist, amabil si foarte serios. Totul a decurs exemplar. Recomand cu incredere si sigur voi reveni!",
  },
  {
    author: "Radu Mosneag",
    rating: 5,
    text: "Am avut o super experiență, Tudor a dat dovada de profesionalism care m-a ajutat la găsirea unei mașini si predarea mașinii într-un timp foarte scurt , recomand cu încredere si pe viitor daca am sa mai am nevoie voi apela din nou la tine cu încredere. Masina închiriată a fost un Hyundai i20 din anul 2023 care m-a surprins foarte plăcut la condus , confortul pe care îl ai fiind o mașină mica. Mulțumesc Tudor încă odată!!!",
  },
  {
    author: "Sabina Botezatu",
    rating: 5,
    text: "Am fost foarte mulțumiți de masina, prețul de închiriere f bun printre cele mai bune din Cluj iar Tudor este f de treaba, disponibil răspunde la toate exigentele. Recomand cu tot dragul. Abia aștept sa revenim in Cluj- Napoca.",
  },
  {
    author: "Ilinca Sasarman",
    rating: 5,
    text: "Recently hired a car from them and the service was amazing.They were on time with pick up and drop off and the car was clean and in great condition.Would highly recommend",
  },
  {
    author: "Emi Stoica",
    rating: 5,
    text: "Recomand cu încredere! Am închiriat o mașină de la Rent’n Go și totul a fost perfect! Domnul e super amabil, comunică rapid și clar, mașina (Skoda) era impecabilă – curată, bine întreținută, cu toate actele în regulă. Am luat-o și returnat-o fără nicio problemă. Serviciu de top, preț corect, mașini foarte bune. Dacă ai nevoie de închiriere în Cluj – aici e soluția!",
  },
  {
    author: "Marcel Ola",
    rating: 5,
    text: "Am avut parte în urma experientei de profesionalism, increderere, mașina curata, promptitudine și disponibilitate maxima. Recomand cu mare încredere! Voi apela cu siguranță și pe viitor la serviciile companiei.",
  },
  {
    author: "Tiberiu Pascan",
    rating: 5,
    text: "Everytime I am traveling back home to Romania , I am eagerly renting from Tudor because the services he is providing, wich are top class and I trully recommend his company due to his professionalism and the dedication to support his customers.",
  },
  {
    author: "Lumi Harrison",
    rating: 5,
    text: "The team is very friendly and professional. The car was delivered on time. Clean and neat. Full petrol. They pick up the car from Bucharest where l end up my journey. They deliver and pick up the car, wherever you need the car. Very satisfied with the service they provide.",
  },
  {
    author: "Claudia Bran",
    rating: 5,
    text: "Experiența excelentă cu această firmă de închirieri auto. Personalul a fost foarte amabil, profesionist și disponibil. Mașina a fost într-o stare impecabilă, curată și foarte bine întreținută. Formalitățile de preluare și predare au fost rapide și fără complicații. Am apreciat seriozitatea, transparența și atenția acordată clienților. În plus, raportul calitate-preț este foarte bun, serviciile oferite fiind pe deplin la nivelul costului. Recomand cu toată încrederea și cu siguranță voi reveni și pe viitor!",
  },
  {
    author: "acasandrei andrea",
    rating: 5,
    text: "Servicii de calitate, personal profesionist și foarte prompt. Am apreciat corectitudinea și rapiditatea cu care au fost rezolvate toate solicitările. Recomand cu încredere!",
  },
  {
    author: "Monica Porumb",
    rating: 5,
    text: "Am fost foarte mulțumiți de profesionalismul si promptitudinea cu care am fost tratati. Raport calitate-pret foarte bun! Mulțumim!",
  },
];
