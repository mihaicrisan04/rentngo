import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Metadata } from "next";

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isRomanian = locale === "ro";

  return {
    title: isRomanian
      ? "Termeni și Condiții | Rent'n Go Cluj-Napoca"
      : "Terms and Conditions | Rent'n Go Cluj-Napoca",
    description: isRomanian
      ? "Termeni și condiții pentru închirieri auto Rent’n Go în Cluj-Napoca și Aeroportul Cluj. Citiți condițiile generale de închiriere."
      : "Terms and conditions for Rent’n Go car rental in Cluj-Napoca and at Cluj Airport. Read the general rental conditions.",
    alternates: {
      canonical: `https://rngo.ro/${locale}/terms`,
      languages: {
        "ro-RO": "https://rngo.ro/ro/terms",
        "en-US": "https://rngo.ro/en/terms",
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function TermsAndConditionsPage({
  params,
}: TermsPageProps) {
  const { locale } = await params;
  const isRomanian = locale === "ro";

  const content = isRomanian
    ? {
        headerTitle: "TERMENI SI CONDITII",
        sections: {
          general: {
            title: "I. DISPOZIŢII GENERALE",
            paragraphs: [
              "1.1. Termenii și Condițiile (denumite în continuare T&C) reglementează funcționarea platformei de închirieri www.rngo.ro (denumită în continuare Site-ul), deținută de societatea RENT'N GO PRODEXA S.R.L. , persoană juridică română cu sediul în Sat Florești, strada Tăuțului, Nr.214D, Jud. Cluj, înregistrată la Registrul Comerțului de pe lângă Tribunalul Cluj sub nr. J12/1445/2024, având C.U.I. 49799254 (denumită în continuare Societatea). T&C sunt concepute pentru a oferi informații relevante despre serviciile de închiriere.",
              "1.2. Prin utilizarea și/sau rezervarea unui autovehicul de pe acest Site și nu numai, vă supuneți în totalitate acestor Termeni și Condiții, precum și legislației din România.",
              "1.3. Navigând pe acest site și/sau efectuând rezervarea unui autovehicul pe www.rngo.ro, declarați că ați înțeles și acceptat prezentele Termeni și Condiții, precum și Politica de Confidențialitate.",
              "1.4. T&C sunt valabile pe o perioadă nedeterminată. Utilizatorii înțeleg că Societatea are dreptul de a le modifica unilateral fără notificare prealabilă către aceștia. Orice modificări vor intra în vigoare imediat după publicarea lor pe Site. Utilizatorii sunt îndemnați să monitorizeze eventualele modificări.",
            ],
          },
          services: {
            title: "II. DESCRIEREA SERVICIILOR",
            paragraphs: [
              "2.1. RENT' N GO PRODEXA este o companie de închirieri auto care vă pune la dispoziție autoturisme în stare optimă de funcționare, curate atât în interior, cât și în exterior. Prin semnarea contractului de închiriere, vă exprimați acordul cu termenii și condițiile, precum și cu politica de confidențialitate a companiei.",
              "2.2. Toate modelele de autoturisme prezentate pe site reflectă gama existentă în flota noastră, dar afișarea acestora nu garantează disponibilitatea în timpul solicitării dvs. După plasarea unei cereri de rezervare, disponibilitatea modelului ales va fi confirmată prin e-mail, telefon sau WhatsApp de către unul dintre reprezentanții noștri.",
              "2.3. Vă reamintim că transmiterea unei cereri de rezervare nu constituie o rezervare fermă a autoturismului respectiv.",
            ],
          },
          rental: {
            title: "III. CONDIȚII GENERALE DE ÎNCHIRIERE",
            paragraphs: [
              "3.1. Taxa pentru închirierea mașinilor în Cluj, asigurarea completă SCDW sau garanția de închiriere se plătesc în avans, fie la confirmarea rezervării, fie la preluarea autoturismului de către dumneavoastră. Perioada minimă de închiriere este de o (1) zi, cu excepția perioadelor de sărbători precum Paștele, Crăciunul, Revelionul și perioada de vară(din luna Iunie până în Septembrie) când perioada minimă de închiriere este de 10 (zece) zile.",
              "3.2. Vârsta minimă pentru închiriere este de 23 de ani, iar conducătorii auto trebuie să dețină permisul de conducere de cel puțin doi an. În caz contrar, ne rezervăm dreptul de a anula comanda dumneavoastră, fără a implica alte consecințe asupra firmei.",
              "3.3. Orice modificare a datelor din contract trebuie comunicată expres de către client, însă nu mai târziu de 24 de ore de la momentul preluării mașinii.",
              "3.4. În perioadele foarte aglomerate, ne rezervăm dreptul de a solicita un avans de 10% din valoarea totală a închirierii. Acest avans este nereturnabil în cazul în care clientul anulează rezervarea sau nu se prezintă pentru preluarea autoturismului la ora și locația stabilite în confirmarea rezervării. De asemenea, în cazul în care a fost aleasă plata integrală la confirmarea rezervării, în cazul anulării rezervării, se va reține doar 10% din suma totală a perioadei de închiriere.",
              "3.5. Facturarea in RON se face la cursul de vanzare al BNR +1% din ziua semnarii Contractului.",
              "3.6. In cazul intarzierii platii, peste termenul stipulat in Contract, Societatea are dreptul de a percepe penalitati in valoare de 3%, din valoarea sumei datorate, pentru fiecare zi de intarziere.",
              "3.7. În perioadele extrem de aglomerate, din cauza volumului mare de cereri și a situațiilor neprevăzute precum accidentele sau defectele tehnice, ne rezervăm dreptul de a vă oferi un model similar celui ales inițial. Refuzul dumneavoastră de a accepta modelul oferit nu atrage obligația noastră de a vă returna avansul plătit.",
              "3.8. Clientul este responsabil să returneze autoturismul în aceeași stare în care a fost preluat, inclusiv toate documentele și accesoriile furnizate în momentul închirierii. Autoturismul trebuie să fie returnat cu rezervorul plin și să fie curățat atât în interior, cât și în exterior. În cazul în care nu puteți returna autoturismul curat, va fi aplicată o taxă de spălare în valoare de 10 euro, iar pentru autoturismele premium și Mini-vanuri, taxa va fi de 18 euro.",
              "3.9. Orice întârziere care depășește ora stabilită în contract va fi taxată cu o zi întreagă de închiriere pentru primele 2 ore. Orice depășire a orei specificate în contract cu peste 2 ore va fi raportată poliției și va fi taxată cu sume între 100 și 300 euro, în funcție de valoarea autoturismului. O excepție pentru paragraful de mai sus poate fi făcută doar în situația în care este menționată în mod explicit în contract și este semnată de ambele părți.",
              "3.10. Tariful de închiriere acoperă o medie de 200 km/zi. Kilometrii suplimentari vor fi taxați cu 5 EUR/50km pentru clasele standard și business și cu 8 EURO/50km pentru clasa premium. În cazul în care autoturismul este returnat cu o cantitate mai mică de combustibil față de momentul închirierii, se va aplica o taxă de 2.5 EUR/litru.",
              "3.12. Pierderea sau distrugerea cheilor autoturismului va fi taxată între 200 și 700 EUR, iar pierderea sau distrugerea documentelor autoturismului va fi taxată cu 100 EUR.",
              "3.13. În anumite condiții, este posibilă conducerea autoturismelor în afara granițelor României, însă doar în țările membre ale UE. Acest aspect trebuie notificat la confirmarea rezervării și implică o taxă de 50 EUR/ieșire, necesară extinderii teritoriale a asigurărilor și emiterii imputernicirilor de conducere pentru șoferi.",
              "3.14. Taxe suplimentare: Orice amendă, pene de cauciuc, taxă de drum sau de parcare etc., precum și contravaloarea eventualelor reparații pe perioada închirierii, rezultate din acțiunile chiriașului, vor fi suportate de către acesta. În plus, în cazul în care, din vina chiriașului, mașina nu mai poate fi condusă pe propriile roți în urma unui accident, prin semnarea acestui contract, clientul se obligă să acopere cheltuielile cu transportul acesteia pe o platformă până la sediul de unde a închiriat-o.",
            ],
          },
          deposit: {
            title: "IV. GARANTIA ȘI ASIGURAREA SCDW",
            paragraphs: [
              "4.1. În momentul preluării autoturismului, clientul este de acord cu blocarea unei garanții cuprinse între 200 și 1800 EUR (în funcție de valoarea mașinii închiriate), fie prin intermediul unui card bancar, fie în numerar. Această sumă va fi restituită integral în cazul în care clientul returnează autoturismul în stare nevătămată, curat și cu toate accesoriile, la locul, data și ora convenite în contract, sau prin achitarea asigurării SCDW (Super Collision Damage Waiver), calculată în funcție de numărul de zile și clasa autoturismului închiriat.",
              "4.2. În cazul garanției de închiriere, aceasta va fi percepută la începutul perioadei de închiriere sau blocată pe cardul bancar și ulterior deblocată la restituirea autoturismului în aceleași condiții ca la preluare. În situația în care autoturismul este returnat foarte murdar, ne rezervăm dreptul de a bloca această garanție până la curățarea autoturismului și stabilirea exactă a stării de returnare. În cazul în care autoturismul este returnat cu daune sau lipsă de accesorii, garanția de închiriere va fi reținută parțial sau integral. Garnția acoperă parțial situația daunelor totale. În această situație, clientul se obligă să achite între 1000 și 8000 EUR în funcție de modelul închiriat.",
              "4.3. Asigurarea SCDW este o asigurare complementară pentru protecția împotriva daunelor și evenimentelor posibile produse din vina clientului sau a unei terțe persoane. Aceasta exonerează clientul de răspunderea financiară în cazul daunelor și reduce la zero valoarea garanției. Asigurarea SCDW acoperă parțial situația daunelor totale. În această situație, clientul se obligă să achite între 1000 și 8000 EUR în funcție de modelul închiriat.",
              "4.4. Asigurarea SCDW nu acoperă combustibilul consumat, daunele aduse anvelopelor și părții inferioare a autovehiculului (sasiu, bloc motor, baie de ulei, cutie de viteze) datorate unei acțiuni deliberare sau neglijente, precum și în cazul pierderii accesoriilor autoturismului.",
              "Atât asigurarea SCDW, cât și garanția de închiriere acoperă doar persoanele înscrise în contract cu dreptul de a conduce autoturismul închiriat.",
            ],
          },
          clientObligations: {
            title: "V. OBLIGATIILE CLIENTULUI",
            paragraphsBeforeList: [
              "5.1. Clientul este responsabil să notifice imediat agenția rent a car despre orice observații referitoare la starea autoturismului în momentul preluării acestuia. În cazul în care observă aspecte suspecte sau semne anormale de funcționare care ar putea afecta starea sau siguranța autoturismului închiriat, este obligat să oprească călătoria și să informeze reprezentantul firmei Societății.",
              "5.2. Prin semnarea contractului de închiriere, Clientul se angajează să respecte următoarele condiții generale de utilizare a mașinii:",
            ],
            list: [
              "a. Respectarea tuturor legilor românești în vigoare referitoare la circulația rutieră.",
              "b. Anunțarea firmei de închirieri înainte de a scoate mașina în afara țării.",
              "c. Abținerea de la împrumutarea mașinii altor persoane care nu sunt înscrise în contract.",
              "d. Abținerea de la subînchirierea mașinii către terți.",
              "e. Evitarea supraîncărcării mașinii (atât în ceea ce privește numărul de locuri, cât și greutatea) peste limitele maxime prevăzute în talonul de înmatriculare.",
              "f. Abținerea de la utilizarea autovehiculului în competiții, teste auto sau alte activități de acest gen.",
              "g. Efectuarea reparațiilor autovehiculului doar în service-urile agreate de proprietar.",
              "h. Asigurarea că autovehiculul nu este lăsat descuiat, cu cheile în contact sau cu geamurile/portbagajul deschise.",
              "i. Conducerea autovehiculului doar pe drumurile publice, fiind interzisă utilizarea acestuia pe drumuri forestiere.",
              "j. Abținerea de la împingerea sau tractarea altor vehicule, rulote sau alte obiecte.",
              "k. Abținerea de la conducerea sub influența băuturilor alcoolice, narcoticelor sau oricărei alte substanțe care ar putea afecta capacitatea sau starea de concentrare a șoferului.",
              "l. Să prezinte originalul permisului de conducere valabil împreună cu un act de identitate.",
              "m. Să nu conducă autovehiculul în afara drumurilor publice, pe drumuri nepavate, neasfaltate sau închise circulației publice.",
              "n. Nu efectuează sau permite intervenții tehnice sau estetice asupra autovehiculului fără consimțământul scris al Societății.",
              "o. În cazul solicitării, informează Societatea despre locația autovehiculului și permite examinarea acestuia de către reprezentanții Societății în maxim 12 de ore de la cerere.",
              "p. Nu utilizează autovehiculul pentru taximetrie, transport alternativ (de exemplu: Uber, Bolt, Bla Bla Car etc.), școli de șoferi, activități de tractare, curse, antrenamente, concursuri, transport de substanțe periculoase sau alte activități ilegale care ar putea deteriora starea autovehiculului. În cazul în care autoturismul închiriat este confiscat sau deteriorat de autorități sau de client prin utilizarea sa în scopuri ilegale, clientul este responsabil pentru achitarea contravaloarii completă a autovehiculului pe care scietatea l-a achitat la achiziționarea acestuia .",
              "q. Clientul are obligația de a menține autovehiculul într-o stare corespunzătoare de funcționare pe întreaga durată a contractului și de a-l preda înapoi în aceeași stare în care a fost preluat. În cazul oricăror daune produse autovehiculului pe durata contractului (inclusiv daune cauzate de coliziuni cu animale sau daune de autor necunoscut), clientul este obligat să suporte costurile tuturor reparațiilor necesare pentru a restabili starea autovehiculului la cea existentă la momentul preluării, cu respectarea procedurii descrise la punctul VII. În caz contrar, clientul va fi responsabil pentru întreaga valoare a reparațiilor, costurile de imobilizare și cheltuielile generate de lipsa de folosință a mașinii.",
            ],
            paragraphsAfterList: [
              "5.3. Pentru nerespectarea obligațiilor enumerate în acest articol Societatea poate să rețină avansurilor încasate, depozitul de garanție, inclusiv în cazul taxelor SCDW.",
            ],
          },
          companyObligations: {
            title: "VI. OBLIGATIILE SOCIETĂȚII",
            paragraphs: [
              "6.1. Sa transmita Clientului dreptul de folosinta asupra autovehiculului ce constituie obiectul Contractului prin: livrarea autovehiculului, completarea datelor de predare-preluare, inmanarea cheilor si a actelor masinii (certificat de inmatriculare, polita de asigurare RCA) in original sau copie.",
              "6.2. Sa asigure Clientului asistenta rutiera, pe teritoriul Romaniei, pe toata durata contractului, in caz de accident sau pana mecanica (defectiune tehnica). Societatea nu este responsabila de remedierea anvelopei in caz de pana.",
              "6.3. Societatea nu este responsabila de pierderile suportate de catre Client in caz de defectare sau avarie a autovehiculului, cu exceptia cheltuielilor autorizate de Societate pentru reparatii.",
              "6.4. Din momentul livrarii autovehiculului si pana la reintrarea in posesia acestuia, Societatea este exonerata de raspundere pentru daunele provocate in trafic de autovehiculul inchiriat Clientului, precum si de taxele de drum ori de pod sau amenzi rezultate din ocuparea abuziva a unui loc de parcare, nerespectarea legislatiei rutiere sau a legilor Romaniei.",
            ],
          },
          damages: {
            title: "VII. OBLIGAȚIILE CLIENTULUI ÎN CAZ DE AVARII ȘI ACCIDENTE",
            paragraphsBeforeList: [
              "7.1. Este responsabilitatea clientului să informeze imediat Societatea despre orice nouă avarie descoperită la autovehiculul închiriat.",
              "7.2. În situația în care dauna este provocată de un autor necunoscut, clientul trebuie să obțină în prealabil Autorizația de Reparație de la autoritățile competente.",
              "7.3. În cazul în care accidentul implică vina clientului și sunt implicate două vehicule:",
            ],
            listOne: [
              "· Clientul trebuie să completeze formularul de constatare amiabilă în cazul în care ambele părți recunosc vina.",
              "· În absența unui acord amiabil, este necesară completarea unui Proces Verbal și obținerea Autorizației de Reparație de la autoritățile competente.",
            ],
            paragraphsBetweenLists: [
              "7.4. Dacă accidentul nu este din culpa clientului și sunt implicate două vehicule:",
            ],
            listTwo: [
              "· Clientul trebuie să completeze formularul de constatare amiabilă în cazul în care ambele părți recunosc vina.",
              "· De asemenea, trebuie furnizate copii ale RCA, Certificatului de Înmatriculare, Cărții de Identitate și Permisului de Conducere ale părții vinovate.",
              "· În cazul în care nu se ajunge la un acord amiabil, este necesară prezentarea copiilor respective, alături de Procesul Verbal și Autorizația de Reparație de la autoritățile competente.",
            ],
            paragraphsAfterList: [
              "7.5. În cazul în care sunt implicate mai mult de două vehicule sau rezultă vătămări corporale, clientul trebuie să contacteze imediat autoritățile pentru a obține un Proces Verbal și o Autorizație de Reparație.",
              "7.6. Dacă autovehiculul este implicat într-un incident în care este lovit un animal, clientul trebuie să anunțe imediat autoritățile competente.",
              "7.7. Clientul are obligația de a verifica corectitudinea completării formularului de constatare amiabilă, Autorizației de Reparație și Procesului Verbal eliberate de autorități în toate cazurile menționate anterior.",
              "7.8. În cazul în care clientul nu respectă procedura în caz de daună, acesta va fi responsabil pentru toate costurile asociate reparațiilor, imobilizării vehiculului și pierderilor de utilizare a mașinii.",
              "7.9. Orice daună apărută în timpul perioadei de închiriere a autovehiculului va fi facturată, inclusiv zgârieturile și alte daune minore.",
            ],
          },
          forceMajeure: {
            title: "VIII. FORȚA MAJORĂ",
            paragraphs: [
              "8.1. Societatea nu va fi responsabilă pentru întârzieri sau incapacitatea de a îndeplini obligațiile contractuale din cauza forței majore, inclusiv dar fără a se limita la cutremure, inundații, incendii, conflicte armate, greve, embargouri sau alte circumstanțe independente de voința sa. În astfel de situații, societatea își va depune toate eforturile rezonabile pentru a minimiza impactul asupra clienților și va comunica în mod corespunzător orice modificări în prestarea serviciilor.",
              "8.2. În cazul în care forța majoră sau alte circumstanțe imprevizibile și imposibile de controlat de către societate fac imposibilă executarea contractului, părțile vor fi eliberate de obligațiile lor fără ca vreo parte să fie răspunzătoare față de cealaltă pentru daune sau alte obligații compensatorii.",
            ],
          },
          intellectualProperty: {
            title: "IX. DREPTURI DE PROPRIETATE INTELECTUALĂ",
            paragraphs: [
              "9.1 Tot ceea ce este postat pe Site precum și pe diverse tipuri de suporturi, cum ar fi, însă fără a se limita la, imagini, texte, elemente de grafică, simboluri, logo-uri, baze de date etc. este proprietatea Societății. Toate acestea cad sub incidența legislației în materie de proprietate intelectuală.",
              "9.2 Vizitatorii și Terții nu pot utiliza, copia, distribui, publica sau incorpora în alte documente sau materiale astfel de marcaje/informații sub nicio formă în scopul obținerii de venituri fără permisiunea prealabilă scrisă și expresă a Societății.",
            ],
          },
          fraud: {
            title: "X. FURNIZAREA DE INFORMAȚII/ TENTATIVE DE FRAUDĂ",
            paragraphs: [
              "10.1 Pentru a utiliza Site-ul, utilizatorii Site-ului sunt de acord să furnizeze informații reale despre ei.",
              "10.2 Orice încercare de a furniza informații false, de a accesa datele personale ale altui utilizator, de a modifica conținutul Site-ului sau de a afecta performanțele serverului pe care este postat Site-ul, va fi considerată tentativă de fraudare a sistemelor Societății şi va duce la blocarea imediată a accesului. De asemenea, Societatea își rezervă dreptul de a anunța autoritățile competente despre această tentativă.",
              "10.3. Societatea nu poate fi făcută responsabilă pentru orice consecințe rezultate din nefuncționarea website-ului său, inclusiv, dar fără a se limita la, indisponibilitatea temporară sau permanentă a acestuia, bug-uri software, erori de programare, sau alte probleme tehnice care pot afecta accesul sau utilizarea platformei online. Utilizatorul acceptă că societatea depune toate eforturile rezonabile pentru a menține funcționarea corespunzătoare a website-ului, însă nu poate garanta lipsa totală a unor astfel de probleme tehnice. În măsura permisă de lege, societatea nu va fi responsabilă față de client sau orice altă parte pentru daunele sau pierderile suferite ca urmare a unor astfel de incidente tehnice legate de website.",
              "10.4. Acest Site poate include link-uri catre alte platforme de internet. Noi nu recomandam alte site-uri web si nu suntem raspunzatori pentru informatiile, materialele, produsele sau serviciile continute in sau accesibile prin intermediul acelor site-uri web. Accesul si utilizarea altor site-uri web se fac exclusiv pe propriul risc.",
            ],
          },
          disputes: {
            title: "XI. CONFLICTE",
            paragraphs: [
              "11.1 Orice conflict apărut între Societate și clienții săi se va soluționa pe cale amiabilă. În cazul în care acest lucru nu este posibil, soluționarea conflictelor este de competența instanțelor române din Cluj-Napoca.",
              "11.2 Legea aplicabilă este legea română.",
              "11.3. Clientul este pus de drept în întarziere pentru toate obligatiile asumate in Contract si nerespectate ca atare la termenele prevăzute sau comunicate.",
              "11.4. Pentru orice disputa, acești T&C constituie o dovada.",
            ],
          },
          final: {
            title: "XII. PREVEDERI FINALE",
            paragraphs: [
              "12.1 T&C reprezintă Contractul dintre consumator și Societate, pot fi cesionate de către aceasta din urmă fără a fi necesar acordul clientului.",
              "12.2. Numele capitolelor și sub-titlurile sunt doar pentru referință și nu trebuie luate în considerare în interpretarea sau construcția prezentelor T&C.",
              "12.3. În cazul declarării vreuneia din clauzele prezentul T&C nulă sau inaplicabilă, restul clauzelor vor continua să își producă efectele, iar clauză declarată nulă sau inaplicabilă va fi înlocuită de o nouă clauză care să reflecte cât mai apropiat cu putință voința Societății.",
            ],
          },
        },
        contact: {
          title: "Informații de Contact",
          companyName: "Rent'n Go Prodexa S.R.L.",
          emailLabel: "Email",
          phoneLabel: "Telefon",
          addressLabel: "Adresă",
          address:
            "Cluj \"Avram Iancu\" International Airport, Strada Traian Vuia 149-151, Cluj-Napoca, România",
        },
        footer: {
          updated: "Termeni și condiții actualizați ultima dată: Ianuarie 2024",
          note:
            "Prin utilizarea serviciilor noastre, recunoașteți că ați citit și înțeles acești termeni și condiții.",
        },
      }
    : {
        headerTitle: "TERMS AND CONDITIONS",
        sections: {
          general: {
            title: "I. GENERAL PROVISIONS",
            paragraphs: [
              "1.1. These Terms and Conditions (hereinafter referred to as the T&C) govern the operation of the car rental platform www.rngo.ro (hereinafter referred to as the Website), owned by RENT'N GO PRODEXA S.R.L., a Romanian legal entity with its registered office in Florești Village, Tăuțului Street, No. 214D, Cluj County, registered with the Trade Register under No. J12/1445/2024, having VAT Registration Number (C.U.I.) 49799254 (hereinafter referred to as the Company). The T&C are intended to provide relevant information regarding the rental services.",
              "1.2. By using and/or booking a vehicle through this Website or otherwise, you fully agree to and are bound by these Terms and Conditions, as well as by the applicable legislation of Romania.",
              "1.3. By browsing this Website and/or making a vehicle reservation on www.rngo.ro, you declare that you have understood and accepted these Terms and Conditions, as well as the Privacy Policy.",
              "1.4. The T&C are valid for an indefinite period. Users acknowledge that the Company has the right to modify them unilaterally without prior notice. Any changes shall take effect immediately upon their publication on the Website. Users are encouraged to regularly review any updates or modifications.",
            ],
          },
          services: {
            title: "II. DESCRIPTION OF SERVICES",
            paragraphs: [
              "2.1. RENT'N GO PRODEXA is a car rental company that provides vehicles in optimal working condition, clean both inside and outside. By signing the rental agreement, you expressly agree to the Company’s Terms and Conditions as well as its Privacy Policy.",
              "2.2. All vehicle models displayed on the Website reflect the range available in our fleet; however, their display does not guarantee availability at the time of your request. After submitting a reservation request, the availability of the selected vehicle will be confirmed by one of our representatives via email, phone, or WhatsApp.",
              "2.3. Please note that submitting a reservation request does not constitute a confirmed reservation of the respective vehicle.",
            ],
          },
          rental: {
            title: "III. GENERAL RENTAL CONDITIONS",
            paragraphs: [
              "3.1. The rental fee for vehicles in Cluj, the full SCDW insurance, or the rental deposit must be paid in advance, either at the time of booking confirmation or upon vehicle pickup. The minimum rental period is one (1) day, except during holiday periods such as Easter, Christmas, New Year’s Eve, and the summer season (from June to September), when the minimum rental period is ten (10) days.",
              "3.2. The minimum age for renting a vehicle is 23 years, and drivers must hold a valid driving license for at least two (2) years. Otherwise, we reserve the right to cancel your order without any further consequences for the Company.",
              "3.3. Any modification to the contract details must be expressly communicated by the client, no later than 24 hours from the moment of vehicle pickup.",
              "3.4. During very busy periods, we reserve the right to request an advance payment of 10% of the total rental value. This advance is non-refundable if the client cancels the reservation or fails to appear for vehicle pickup at the time and location specified in the booking confirmation. If full payment was selected at the time of booking confirmation, in the event of cancellation, only 10% of the total rental amount will be retained.",
              "3.5. Invoicing in RON is carried out at the National Bank of Romania (BNR) selling exchange rate plus 1%, applicable on the date of signing the Contract.",
              "3.6. In the event of late payment beyond the deadline stipulated in the Contract, the Company has the right to charge penalties amounting to 3% of the outstanding amount for each day of delay.",
              "3.7. During extremely busy periods, due to a high volume of requests and unforeseen situations such as accidents or technical malfunctions, we reserve the right to offer a vehicle similar to the one initially selected. Refusal to accept the offered vehicle does not oblige us to refund the advance payment made.",
              "3.8. The client is responsible for returning the vehicle in the same condition in which it was received, including all documents and accessories provided at the time of rental. The vehicle must be returned with a full fuel tank and clean both inside and outside. If the vehicle cannot be returned clean, a cleaning fee of 10 EUR will be applied; for premium vehicles and minivans, the fee will be 18 EUR.",
              "3.9. Any delay exceeding the return time specified in the contract will be charged as a full rental day for the first two (2) hours. Any delay exceeding the specified return time by more than two (2) hours will be reported to the police and charged between 100 and 300 EUR, depending on the value of the vehicle. An exception to the above may only be made if explicitly stated in the contract and signed by both parties.",
              "3.10. The rental rate includes an average allowance of 200 km per day. Additional kilometers will be charged at rates between 5 EUR per 50 km and 15 EUR per 50 km, depending on the rented vehicle model. If the vehicle is returned with a lower fuel level than at the time of pickup, a fee of 2.5 EUR per liter will be applied.",
              "3.12. Loss or destruction of the vehicle keys will be charged between 200 and 700 EUR, and loss or destruction of the vehicle documents will be charged 100 EUR.",
              "3.13. Under certain conditions, driving the vehicle outside the borders of Romania is permitted only within European Union member states. This must be notified at the time of booking confirmation and involves a fee of 50 EUR per exit, required for extending the territorial coverage of the insurance and issuing driving authorizations for the drivers.",
              "3.14. Additional fees: Any fines, tire punctures, road or parking fees, as well as the cost of any repairs during the rental period resulting from the renter’s actions, shall be borne by the renter. Furthermore, if, due to the renter’s fault, the vehicle can no longer be driven on its own wheels following an accident, by signing this contract the client agrees to cover the costs of transporting the vehicle on a recovery platform to the location from which it was rented.",
            ],
          },
          deposit: {
            title: "IV. DEPOSIT AND SCDW INSURANCE",
            paragraphs: [
              "4.1. At the time of vehicle pickup, the client agrees to the blocking or payment of a deposit ranging between 200 and 1,800 EUR (depending on the value of the rented vehicle), either by bank card or in cash. This amount will be fully refunded if the client returns the vehicle undamaged, clean, and with all accessories, at the location, date, and time agreed in the contract, or by purchasing the SCDW (Super Collision Damage Waiver) insurance, calculated based on the number of rental days and the class of the rented vehicle.",
              "4.2. In the case of the rental deposit, it will be charged at the beginning of the rental period or blocked on the client’s bank card and subsequently released upon the return of the vehicle under the same conditions as at pickup. If the vehicle is returned excessively dirty, we reserve the right to retain the deposit until the vehicle has been cleaned and its return condition accurately assessed. If the vehicle is returned with damages or missing accessories, the rental deposit will be partially or fully retained. The deposit partially covers total loss situations. In such cases, the client undertakes to pay an amount between 1,000 and 8,000 EUR, depending on the rented vehicle model.",
              "4.3. The SCDW insurance is a supplementary insurance providing protection against damages and possible events caused by the client or by a third party. It releases the client from financial liability in the event of damages and reduces the deposit amount to zero. The SCDW insurance partially covers total loss situations. In such cases, the client undertakes to pay an amount between 1,000 and 8,000 EUR, depending on the rented vehicle model.",
              "4.4. The SCDW insurance does not cover consumed fuel, damage to tires, or damage to the lower part of the vehicle (chassis, engine block, oil pan, gearbox) resulting from deliberate or negligent actions, nor does it cover the loss of vehicle accessories.",
              "Both the SCDW insurance and the rental deposit apply only to the individuals listed in the contract as authorized drivers of the rented vehicle.",
            ],
          },
          clientObligations: {
            title: "V. CLIENT OBLIGATIONS",
            paragraphsBeforeList: [
              "5.1. The Client is responsible for immediately notifying the car rental agency of any observations regarding the condition of the vehicle at the time of pickup. If the Client notices any suspicious issues or abnormal operating signs that may affect the condition or safety of the rented vehicle, the Client is obliged to stop the journey and inform a Company representative.",
              "5.2. By signing the rental agreement, the Client undertakes to comply with the following general conditions of vehicle use:",
            ],
            list: [
              "a. To comply with all applicable Romanian laws regarding road traffic.",
              "b. To notify the rental company before taking the vehicle outside the country.",
              "c. To refrain from lending the vehicle to persons not listed in the contract.",
              "d. To refrain from sub-renting the vehicle to third parties.",
              "e. To avoid overloading the vehicle (both in terms of seating capacity and weight) beyond the maximum limits specified in the vehicle registration certificate.",
              "f. To refrain from using the vehicle in competitions, automotive tests, or similar activities.",
              "g. To carry out vehicle repairs only in service centers approved by the owner.",
              "h. To ensure that the vehicle is not left unlocked, with the keys in the ignition, or with the windows or trunk open.",
              "i. To drive the vehicle only on public roads; use on forest roads is prohibited.",
              "j. To refrain from pushing or towing other vehicles, trailers, or objects.",
              "k. To refrain from driving under the influence of alcohol, narcotics, or any other substances that may affect the driver’s ability or level of concentration.",
              "l. To present the original valid driving license together with an identity document.",
              "m. Not to drive the vehicle outside public roads, on unpaved, non-asphalted roads, or roads closed to public traffic.",
              "n. Not to perform or allow any technical or aesthetic modifications to the vehicle without the Company’s prior written consent.",
              "o. Upon request, to inform the Company of the vehicle’s location and allow its inspection by Company representatives within a maximum of 12 hours from the request.",
              "p. Not to use the vehicle for taxi services, alternative transportation services (such as Uber, Bolt, BlaBlaCar, etc.), driving schools, towing activities, races, training sessions, competitions, transportation of hazardous substances, or any other illegal activities that may damage the condition of the vehicle. If the rented vehicle is confiscated or damaged by authorities or by the Client due to illegal use, the Client shall be responsible for paying the full value of the vehicle as paid by the Company at the time of its acquisition.",
              "q. The Client is obliged to maintain the vehicle in proper working condition throughout the duration of the contract and to return it in the same condition as at pickup. In the event of any damage to the vehicle during the rental period (including damage caused by collisions with animals or damage caused by unknown parties), the Client is required to bear the costs of all repairs necessary to restore the vehicle to its condition at the time of pickup, in accordance with the procedure described in Section VII. Otherwise, the Client shall be responsible for the full value of the repairs, immobilization costs, and expenses resulting from the loss of use of the vehicle.",
            ],
            paragraphsAfterList: [
              "5.3. In the event of failure to comply with the obligations set forth in this section, the Company may retain any advance payments received, the security deposit, including any SCDW fees.",
            ],
          },
          companyObligations: {
            title: "VI. COMPANY OBLIGATIONS",
            paragraphs: [
              "6.1. To grant the Client the right of use over the vehicle that is the subject of the Contract by delivering the vehicle, completing the handover documentation, and providing the vehicle keys and documents (vehicle registration certificate and RCA insurance policy), either in original or copy.",
              "6.2. To provide the Client with roadside assistance within the territory of Romania for the entire duration of the contract, in the event of an accident or mechanical breakdown (technical malfunction). The Company is not responsible for repairing the tire in the event of a puncture.",
              "6.3. The Company shall not be responsible for losses incurred by the Client in the event of vehicle malfunction or damage, except for repair costs expressly authorized by the Company.",
              "6.4. From the moment the vehicle is delivered until it is returned to the Company, the Company is released from liability for any damages caused in traffic by the vehicle rented to the Client, as well as for road or bridge tolls or fines resulting from improper parking, non-compliance with road traffic regulations, or violations of Romanian law.",
            ],
          },
          damages: {
            title: "VII. CLIENT OBLIGATIONS IN CASE OF DAMAGES AND ACCIDENTS",
            paragraphsBeforeList: [
              "7.1. It is the Client’s responsibility to immediately inform the Company of any new damage discovered to the rented vehicle.",
              "7.2. In the event that the damage is caused by an unknown party, the Client must obtain a Repair Authorization from the competent authorities in advance.",
              "7.3. If the accident is caused by the Client and involves two vehicles:",
            ],
            listOne: [
              "The Client must complete the amicable accident report form if both parties acknowledge fault.",
              "In the absence of an amicable settlement, a Police Report must be completed and a Repair Authorization must be obtained from the competent authorities.",
            ],
            paragraphsBetweenLists: [
              "7.4. If the accident is not the Client’s fault and involves two vehicles:",
            ],
            listTwo: [
              "The Client must complete the amicable accident report form if both parties acknowledge fault.",
              "Copies of the third party’s RCA insurance, Vehicle Registration Certificate, Identity Card, and Driving License must also be provided.",
              "If an amicable settlement cannot be reached, the above documents must be submitted together with the Police Report and the Repair Authorization issued by the competent authorities.",
            ],
            paragraphsAfterList: [
              "7.5. If more than two vehicles are involved or if bodily injuries occur, the Client must immediately contact the authorities in order to obtain a Police Report and a Repair Authorization.",
              "7.6. If the vehicle is involved in an incident in which an animal is struck, the Client must immediately notify the competent authorities.",
              "7.7. The Client is obliged to verify the accuracy and completeness of the amicable accident report form, the Repair Authorization, and the Police Report issued by the authorities in all the cases mentioned above.",
              "7.8. If the Client fails to comply with the damage reporting procedure, the Client shall be responsible for all costs associated with repairs, vehicle immobilization, and loss of use of the vehicle.",
              "7.9. Any damage occurring during the rental period of the vehicle shall be invoiced, including scratches and other minor damages.",
            ],
          },
          forceMajeure: {
            title: "VIII. FORCE MAJEURE",
            paragraphs: [
              "8.1. The Company shall not be held liable for delays or failure to perform its contractual obligations due to force majeure events, including but not limited to earthquakes, floods, fires, armed conflicts, strikes, embargoes, or other circumstances beyond its control. In such situations, the Company shall make all reasonable efforts to minimize the impact on clients and shall appropriately communicate any changes in the provision of services.",
              "8.2. If force majeure or other unforeseen and uncontrollable circumstances make the performance of the contract impossible, the parties shall be released from their obligations, and neither party shall be liable to the other for damages or any other compensatory obligations.",
            ],
          },
          intellectualProperty: {
            title: "IX. INTELLECTUAL PROPERTY RIGHTS",
            paragraphs: [
              "9.1. Everything posted on the Website and on various types of media, such as, but not limited to, images, texts, graphic elements, symbols, logos, databases, etc., is the property of the Company. All of these fall under intellectual property legislation.",
              "9.2. Visitors and Third Parties may not use, copy, distribute, publish, or incorporate in other documents or materials such marks or information in any form for the purpose of obtaining income without the Company’s prior written and express permission.",
            ],
          },
          fraud: {
            title: "X. PROVIDING INFORMATION / ATTEMPTS OF FRAUD",
            paragraphs: [
              "10.1. To use the Website, users agree to provide real information about themselves.",
              "10.2. Any attempt to provide false information, to access another user’s personal data, to modify the content of the Website, or to affect the performance of the server on which the Website is hosted will be considered an attempt to defraud the Company’s systems and will lead to immediate blocking of access. The Company also reserves the right to notify the competent authorities about this attempt.",
              "10.3. The Company cannot be held responsible for any consequences resulting from the malfunction of its website, including, but not limited to, temporary or permanent unavailability, software bugs, programming errors, or other technical problems that may affect access or use of the online platform. The user accepts that the Company makes all reasonable efforts to maintain proper functioning of the website, but cannot guarantee the total absence of such technical problems. To the extent permitted by law, the Company shall not be liable to the client or any other party for damages or losses suffered as a result of such technical incidents related to the website.",
              "10.4. This Website may include links to other internet platforms. We do not recommend other websites and are not responsible for the information, materials, products, or services contained in or accessible through those websites. Access and use of other websites are at your own risk.",
            ],
          },
          disputes: {
            title: "XI. DISPUTES",
            paragraphs: [
              "11.1. Any conflict between the Company and its clients will be resolved amicably. If this is not possible, disputes are under the jurisdiction of Romanian courts in Cluj-Napoca.",
              "11.2. Applicable law is Romanian law.",
              "11.3. The Client is deemed in default by law for all obligations assumed in the Contract and not complied with at the stipulated or communicated terms.",
              "11.4. For any dispute, these T&C constitute proof.",
            ],
          },
          final: {
            title: "XII. FINAL PROVISIONS",
            paragraphs: [
              "12.1. The T&C represent the Contract between the consumer and the Company and may be assigned by the Company without the client’s consent.",
              "12.2. Chapter names and subtitles are for reference only and should not be considered in the interpretation or construction of these T&C.",
              "12.3. If any clause of these T&C is declared null or unenforceable, the remaining clauses shall continue to be effective, and the null or unenforceable clause shall be replaced by a new clause that reflects as closely as possible the Company’s intent.",
            ],
          },
        },
        contact: {
          title: "Contact Information",
          companyName: "Rent'n Go Prodexa S.R.L.",
          emailLabel: "Email",
          phoneLabel: "Phone",
          addressLabel: "Address",
          address:
            "Cluj \"Avram Iancu\" International Airport, Strada Traian Vuia 149-151, Cluj-Napoca, Romania",
        },
        footer: {
          updated: "Terms and conditions last updated: January 2024",
          note:
            "By using our services, you acknowledge that you have read and understood these terms and conditions.",
        },
      };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          {content.headerTitle}
        </h1>
      </div>

      <Separator className="mb-8" />

      {/* I. DISPOZIŢII GENERALE */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {content.sections.general.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.general.paragraphs.map((paragraph, index) => (
            <p key={`general-${index}`}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>

      {/* II. DESCRIEREA SERVICIILOR */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {content.sections.services.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.services.paragraphs.map((paragraph, index) => (
            <p key={`services-${index}`}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>

      {/* III. CONDIȚII GENERALE DE ÎNCHIRIERE */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {content.sections.rental.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.rental.paragraphs.map((paragraph, index) => (
            <p key={`rental-${index}`}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>

      {/* IV. GARANTIA ȘI ASIGURAREA SCDW */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {content.sections.deposit.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.deposit.paragraphs.map((paragraph, index) => (
            <p key={`deposit-${index}`}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>

      {/* V. OBLIGATIILE CLIENTULUI */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {content.sections.clientObligations.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.clientObligations.paragraphsBeforeList.map(
            (paragraph, index) => (
              <p key={`client-obligations-before-${index}`}>{paragraph}</p>
            )
          )}
          <ul className="list-disc list-inside space-y-2 ml-4">
            {content.sections.clientObligations.list.map((item, index) => (
              <li key={`client-obligation-${index}`}>{item}</li>
            ))}
          </ul>
          {content.sections.clientObligations.paragraphsAfterList.map(
            (paragraph, index) => (
              <p key={`client-obligations-after-${index}`}>{paragraph}</p>
            )
          )}
        </CardContent>
      </Card>

      {/* VI. OBLIGATIILE SOCIETĂȚII */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {content.sections.companyObligations.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.companyObligations.paragraphs.map(
            (paragraph, index) => (
              <p key={`company-obligations-${index}`}>{paragraph}</p>
            )
          )}
        </CardContent>
      </Card>

      {/* VII. OBLIGAȚIILE CLIENTULUI ÎN CAZ DE AVARII ȘI ACCIDENTE */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {content.sections.damages.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.damages.paragraphsBeforeList.map(
            (paragraph, index) => (
              <p key={`damages-before-${index}`}>{paragraph}</p>
            )
          )}
          <ul className="list-disc list-inside space-y-2 ml-4">
            {content.sections.damages.listOne.map((item, index) => (
              <li key={`damages-list-one-${index}`}>{item}</li>
            ))}
          </ul>
          {content.sections.damages.paragraphsBetweenLists.map(
            (paragraph, index) => (
              <p key={`damages-between-${index}`}>{paragraph}</p>
            )
          )}
          <ul className="list-disc list-inside space-y-2 ml-4">
            {content.sections.damages.listTwo.map((item, index) => (
              <li key={`damages-list-two-${index}`}>{item}</li>
            ))}
          </ul>
          {content.sections.damages.paragraphsAfterList.map(
            (paragraph, index) => (
              <p key={`damages-after-${index}`}>{paragraph}</p>
            )
          )}
        </CardContent>
      </Card>

      {/* VIII. FORȚA MAJORĂ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {content.sections.forceMajeure.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.forceMajeure.paragraphs.map((paragraph, index) => (
            <p key={`force-majeure-${index}`}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>

      {/* IX. DREPTURI DE PROPRIETATE INTELECTUALĂ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {content.sections.intellectualProperty.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.intellectualProperty.paragraphs.map(
            (paragraph, index) => (
              <p key={`intellectual-property-${index}`}>{paragraph}</p>
            )
          )}
        </CardContent>
      </Card>

      {/* X. FURNIZAREA DE INFORMAȚII/ TENTATIVE DE FRAUDĂ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {content.sections.fraud.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.fraud.paragraphs.map((paragraph, index) => (
            <p key={`fraud-${index}`}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>

      {/* XI. CONFLICTE */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {content.sections.disputes.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.disputes.paragraphs.map((paragraph, index) => (
            <p key={`disputes-${index}`}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>

      {/* XII. PREVEDERI FINALE */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            {content.sections.final.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.sections.final.paragraphs.map((paragraph, index) => (
            <p key={`final-${index}`}>{paragraph}</p>
          ))}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Contact Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{content.contact.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>{content.contact.companyName}</strong>
          </p>
          <p>
            {content.contact.emailLabel}: {" "}
            <Link
              href="mailto:office@rngo.ro"
              className="text-primary hover:underline"
            >
              office@rngo.ro
            </Link>
          </p>
          <p>
            {content.contact.phoneLabel}: +40773932961
          </p>
          <p>
            {content.contact.addressLabel}: {content.contact.address}
          </p>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Footer Note */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{content.footer.updated}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {content.footer.note}
        </p>
      </div>
    </div>
  );
}
