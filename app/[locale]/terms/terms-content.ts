import type { Locale } from "@/i18n";

type TermsBlock = string | { list: string[] };

interface TermsSection {
  title: string;
  blocks: TermsBlock[];
}

interface TermsContent {
  heading: string;
  sections: TermsSection[];
  contact: {
    title: string;
    emailLabel: string;
    phoneLabel: string;
    addressLabel: string;
    address: string;
  };
  lastUpdated: string;
  acknowledgement: string;
}

const ro: TermsContent = {
  heading: "TERMENI SI CONDITII",
  sections: [
    {
      title: "I. DISPOZIŢII GENERALE",
      blocks: [
        "1.1. Termenii și Condițiile (denumite în continuare T&C) reglementează funcționarea platformei de închirieri www.rngo.ro (denumită în continuare Site-ul), deținută de societatea RENT'N GO PRODEXA S.R.L. , persoană juridică română cu sediul în Sat Florești, strada Tăuțului, Nr.214D, Jud. Cluj, înregistrată la Registrul Comerțului de pe lângă Tribunalul Cluj sub nr. J12/1445/2024, având C.U.I. 49799254 (denumită în continuare Societatea). T&C sunt concepute pentru a oferi informații relevante despre serviciile de închiriere.",
        "1.2. Prin utilizarea și/sau rezervarea unui autovehicul de pe acest Site și nu numai, vă supuneți în totalitate acestor Termeni și Condiții, precum și legislației din România.",
        "1.3. Navigând pe acest site și/sau efectuând rezervarea unui autovehicul pe www.rngo.ro, declarați că ați înțeles și acceptat prezentele Termeni și Condiții, precum și Politica de Confidențialitate.",
        "1.4. T&C sunt valabile pe o perioadă nedeterminată. Utilizatorii înțeleg că Societatea are dreptul de a le modifica unilateral fără notificare prealabilă către aceștia. Orice modificări vor intra în vigoare imediat după publicarea lor pe Site. Utilizatorii sunt îndemnați să monitorizeze eventualele modificări.",
      ],
    },
    {
      title: "II. DESCRIEREA SERVICIILOR",
      blocks: [
        "2.1. RENT' N GO PRODEXA este o companie de închirieri auto care vă pune la dispoziție autoturisme în stare optimă de funcționare, curate atât în interior, cât și în exterior. Prin semnarea contractului de închiriere, vă exprimați acordul cu termenii și condițiile, precum și cu politica de confidențialitate a companiei.",
        "2.2. Toate modelele de autoturisme prezentate pe site reflectă gama existentă în flota noastră, dar afișarea acestora nu garantează disponibilitatea în timpul solicitării dvs. După plasarea unei cereri de rezervare, disponibilitatea modelului ales va fi confirmată prin e-mail, telefon sau WhatsApp de către unul dintre reprezentanții noștri.",
        "2.3. Vă reamintim că transmiterea unei cereri de rezervare nu constituie o rezervare fermă a autoturismului respectiv.",
      ],
    },
    {
      title: "III. CONDIȚII GENERALE DE ÎNCHIRIERE",
      blocks: [
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
    {
      title: "IV. GARANTIA ȘI ASIGURAREA SCDW",
      blocks: [
        "4.1. În momentul preluării autoturismului, clientul este de acord cu blocarea unei garanții cuprinse între 200 și 1800 EUR (în funcție de valoarea mașinii închiriate), fie prin intermediul unui card bancar, fie în numerar. Această sumă va fi restituită integral în cazul în care clientul returnează autoturismul în stare nevătămată, curat și cu toate accesoriile, la locul, data și ora convenite în contract, sau prin achitarea asigurării SCDW (Super Collision Damage Waiver), calculată în funcție de numărul de zile și clasa autoturismului închiriat.",
        "4.2. În cazul garanției de închiriere, aceasta va fi percepută la începutul perioadei de închiriere sau blocată pe cardul bancar și ulterior deblocată la restituirea autoturismului în aceleași condiții ca la preluare. În situația în care autoturismul este returnat foarte murdar, ne rezervăm dreptul de a bloca această garanție până la curățarea autoturismului și stabilirea exactă a stării de returnare. În cazul în care autoturismul este returnat cu daune sau lipsă de accesorii, garanția de închiriere va fi reținută parțial sau integral. Garnția acoperă parțial situația daunelor totale. În această situație, clientul se obligă să achite între 1000 și 8000 EUR în funcție de modelul închiriat.",
        "4.3. Asigurarea SCDW este o asigurare complementară pentru protecția împotriva daunelor și evenimentelor posibile produse din vina clientului sau a unei terțe persoane. Aceasta exonerează clientul de răspunderea financiară în cazul daunelor și reduce la zero valoarea garanției. Asigurarea SCDW acoperă parțial situația daunelor totale. În această situație, clientul se obligă să achite între 1000 și 8000 EUR în funcție de modelul închiriat.",
        "4.4. Asigurarea SCDW nu acoperă combustibilul consumat, daunele aduse anvelopelor și părții inferioare a autovehiculului (sasiu, bloc motor, baie de ulei, cutie de viteze) datorate unei acțiuni deliberare sau neglijente, precum și în cazul pierderii accesoriilor autoturismului.",
        "Atât asigurarea SCDW, cât și garanția de închiriere acoperă doar persoanele înscrise în contract cu dreptul de a conduce autoturismul închiriat.",
      ],
    },
    {
      title: "V. OBLIGATIILE CLIENTULUI",
      blocks: [
        "5.1. Clientul este responsabil să notifice imediat agenția rent a car despre orice observații referitoare la starea autoturismului în momentul preluării acestuia. În cazul în care observă aspecte suspecte sau semne anormale de funcționare care ar putea afecta starea sau siguranța autoturismului închiriat, este obligat să oprească călătoria și să informeze reprezentantul firmei Societății.",
        "5.2. Prin semnarea contractului de închiriere, Clientul se angajează să respecte următoarele condiții generale de utilizare a mașinii:",
        {
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
        },
        "5.3. Pentru nerespectarea obligațiilor enumerate în acest articol Societatea poate să rețină avansurilor încasate, depozitul de garanție, inclusiv în cazul taxelor SCDW.",
      ],
    },
    {
      title: "VI. OBLIGATIILE SOCIETĂȚII",
      blocks: [
        "6.1. Sa transmita Clientului dreptul de folosinta asupra autovehiculului ce constituie obiectul Contractului prin: livrarea autovehiculului, completarea datelor de predare-preluare, inmanarea cheilor si a actelor masinii (certificat de inmatriculare, polita de asigurare RCA) in original sau copie.",
        "6.2. Sa asigure Clientului asistenta rutiera, pe teritoriul Romaniei, pe toata durata contractului, in caz de accident sau pana mecanica (defectiune tehnica). Societatea nu este responsabila de remedierea anvelopei in caz de pana.",
        "6.3. Societatea nu este responsabila de pierderile suportate de catre Client in caz de defectare sau avarie a autovehiculului, cu exceptia cheltuielilor autorizate de Societate pentru reparatii.",
        "6.4. Din momentul livrarii autovehiculului si pana la reintrarea in posesia acestuia, Societatea este exonerata de raspundere pentru daunele provocate in trafic de autovehiculul inchiriat Clientului, precum si de taxele de drum ori de pod sau amenzi rezultate din ocuparea abuziva a unui loc de parcare, nerespectarea legislatiei rutiere sau a legilor Romaniei.",
      ],
    },
    {
      title: "VII. OBLIGAȚIILE CLIENTULUI ÎN CAZ DE AVARII ȘI ACCIDENTE",
      blocks: [
        "7.1. Este responsabilitatea clientului să informeze imediat Societatea despre orice nouă avarie descoperită la autovehiculul închiriat.",
        "7.2. În situația în care dauna este provocată de un autor necunoscut, clientul trebuie să obțină în prealabil Autorizația de Reparație de la autoritățile competente.",
        "7.3. În cazul în care accidentul implică vina clientului și sunt implicate două vehicule:",
        {
          list: [
            "Clientul trebuie să completeze formularul de constatare amiabilă în cazul în care ambele părți recunosc vina.",
            "În absența unui acord amiabil, este necesară completarea unui Proces Verbal și obținerea Autorizației de Reparație de la autoritățile competente.",
          ],
        },
        "7.4. Dacă accidentul nu este din culpa clientului și sunt implicate două vehicule:",
        {
          list: [
            "Clientul trebuie să completeze formularul de constatare amiabilă în cazul în care ambele părți recunosc vina.",
            "De asemenea, trebuie furnizate copii ale RCA, Certificatului de Înmatriculare, Cărții de Identitate și Permisului de Conducere ale părții vinovate.",
            "În cazul în care nu se ajunge la un acord amiabil, este necesară prezentarea copiilor respective, alături de Procesul Verbal și Autorizația de Reparație de la autoritățile competente.",
          ],
        },
        "7.5. În cazul în care sunt implicate mai mult de două vehicule sau rezultă vătămări corporale, clientul trebuie să contacteze imediat autoritățile pentru a obține un Proces Verbal și o Autorizație de Reparație.",
        "7.6. Dacă autovehiculul este implicat într-un incident în care este lovit un animal, clientul trebuie să anunțe imediat autoritățile competente.",
        "7.7. Clientul are obligația de a verifica corectitudinea completării formularului de constatare amiabilă, Autorizației de Reparație și Procesului Verbal eliberate de autorități în toate cazurile menționate anterior.",
        "7.8. În cazul în care clientul nu respectă procedura în caz de daună, acesta va fi responsabil pentru toate costurile asociate reparațiilor, imobilizării vehiculului și pierderilor de utilizare a mașinii.",
        "7.9. Orice daună apărută în timpul perioadei de închiriere a autovehiculului va fi facturată, inclusiv zgârieturile și alte daune minore.",
      ],
    },
    {
      title: "VIII. FORȚA MAJORĂ",
      blocks: [
        "8.1. Societatea nu va fi responsabilă pentru întârzieri sau incapacitatea de a îndeplini obligațiile contractuale din cauza forței majore, inclusiv dar fără a se limita la cutremure, inundații, incendii, conflicte armate, greve, embargouri sau alte circumstanțe independente de voința sa. În astfel de situații, societatea își va depune toate eforturile rezonabile pentru a minimiza impactul asupra clienților și va comunica în mod corespunzător orice modificări în prestarea serviciilor.",
        "8.2. În cazul în care forța majoră sau alte circumstanțe imprevizibile și imposibile de controlat de către societate fac imposibilă executarea contractului, părțile vor fi eliberate de obligațiile lor fără ca vreo parte să fie răspunzătoare față de cealaltă pentru daune sau alte obligații compensatorii.",
      ],
    },
    {
      title: "IX. DREPTURI DE PROPRIETATE INTELECTUALĂ",
      blocks: [
        "9.1 Tot ceea ce este postat pe Site precum și pe diverse tipuri de suporturi, cum ar fi, însă fără a se limita la, imagini, texte, elemente de grafică, simboluri, logo-uri, baze de date etc. este proprietatea Societății. Toate acestea cad sub incidența legislației în materie de proprietate intelectuală.",
        "9.2 Vizitatorii și Terții nu pot utiliza, copia, distribui, publica sau incorpora în alte documente sau materiale astfel de marcaje/informații sub nicio formă în scopul obținerii de venituri fără permisiunea prealabilă scrisă și expresă a Societății.",
      ],
    },
    {
      title: "X. FURNIZAREA DE INFORMAȚII/ TENTATIVE DE FRAUDĂ",
      blocks: [
        "10.1 Pentru a utiliza Site-ul, utilizatorii Site-ului sunt de acord să furnizeze informații reale despre ei.",
        "10.2 Orice încercare de a furniza informații false, de a accesa datele personale ale altui utilizator, de a modifica conținutul Site-ului sau de a afecta performanțele serverului pe care este postat Site-ul, va fi considerată tentativă de fraudare a sistemelor Societății şi va duce la blocarea imediată a accesului. De asemenea, Societatea își rezervă dreptul de a anunța autoritățile competente despre această tentativă.",
        "10.3. Societatea nu poate fi făcută responsabilă pentru orice consecințe rezultate din nefuncționarea website-ului său, inclusiv, dar fără a se limita la, indisponibilitatea temporară sau permanentă a acestuia, bug-uri software, erori de programare, sau alte probleme tehnice care pot afecta accesul sau utilizarea platformei online. Utilizatorul acceptă că societatea depune toate eforturile rezonabile pentru a menține funcționarea corespunzătoare a website-ului, însă nu poate garanta lipsa totală a unor astfel de probleme tehnice. În măsura permisă de lege, societatea nu va fi responsabilă față de client sau orice altă parte pentru daunele sau pierderile suferite ca urmare a unor astfel de incidente tehnice legate de website.",
        "10.4. Acest Site poate include link-uri catre alte platforme de internet. Noi nu recomandam alte site-uri web si nu suntem raspunzatori pentru informatiile, materialele, produsele sau serviciile continute in sau accesibile prin intermediul acelor site-uri web. Accesul si utilizarea altor site-uri web se fac exclusiv pe propriul risc.",
      ],
    },
    {
      title: "XI. CONFLICTE",
      blocks: [
        "11.1 Orice conflict apărut între Societate și clienții săi se va soluționa pe cale amiabilă. În cazul în care acest lucru nu este posibil, soluționarea conflictelor este de competența instanțelor române din Cluj- Napoca.",
        "11.2 Legea aplicabilă este legea română.",
        "11.3. Clientul este pus de drept în întarziere pentru toate obligatiile asumate in Contract si nerespectate ca atare la termenele prevăzute sau comunicate.",
        "11.4. Pentru orice disputa, acești T&C constituie o dovada.",
      ],
    },
    {
      title: "XII. PREVEDERI FINALE",
      blocks: [
        "12.1 T&C reprezintă Contractul dintre consumator și Societate, pot fi cesionate de către aceasta din urmă fără a fi necesar acordul clientului.",
        "12.2. Numele capitolelor și sub-titlurile sunt doar pentru referință și nu trebuie luate în considerare în interpretarea sau construcția prezentelor T&C.",
        "12.3. În cazul declarării vreuneia din clauzele prezentul T&C nulă sau inaplicabilă, restul clauzelor vor continua să își producă efectele, iar clauză declarată nulă sau inaplicabilă va fi înlocuită de o nouă clauză care să reflecte cât mai apropiat cu putință voința Societății.",
      ],
    },
  ],
  contact: {
    title: "Informații de Contact",
    emailLabel: "Email",
    phoneLabel: "Telefon",
    addressLabel: "Adresă",
    address:
      'Cluj "Avram Iancu" International Airport, Strada Traian Vuia 149-151, Cluj-Napoca, România',
  },
  lastUpdated: "Termeni și condiții actualizați ultima dată: Ianuarie 2024",
  acknowledgement:
    "Prin utilizarea serviciilor noastre, recunoașteți că ați citit și înțeles acești termeni și condiții.",
};

const en: TermsContent = {
  heading: "TERMS AND CONDITIONS",
  sections: [
    {
      title: "I. GENERAL PROVISIONS",
      blocks: [
        "1.1. These Terms and Conditions (hereinafter T&C) govern the operation of the rental platform www.rngo.ro (hereinafter the Site), owned by RENT'N GO PRODEXA S.R.L., a Romanian legal entity with its registered office in Sat Florești, Tăuțului Street, No. 214D, Cluj County, registered with the Trade Register of the Cluj Tribunal under no. J12/1445/2024, with tax ID (C.U.I.) 49799254 (hereinafter the Company). The T&C are intended to provide relevant information about the rental services.",
        "1.2. By using and/or booking a vehicle from this Site or by other means, you fully agree to these Terms and Conditions and to Romanian law.",
        "1.3. By browsing this site and/or booking a vehicle on www.rngo.ro, you declare that you have understood and accepted these Terms and Conditions, as well as the Privacy Policy.",
        "1.4. The T&C are valid for an indefinite period. Users understand that the Company has the right to amend them unilaterally without prior notice. Any changes take effect immediately after being published on the Site. Users are encouraged to monitor any changes.",
      ],
    },
    {
      title: "II. DESCRIPTION OF SERVICES",
      blocks: [
        "2.1. RENT'N GO PRODEXA is a car rental company that provides vehicles in optimal working condition, clean both inside and out. By signing the rental contract, you agree to the company's terms and conditions and privacy policy.",
        "2.2. All vehicle models shown on the site reflect the range available in our fleet, but displaying them does not guarantee availability at the time of your request. After you submit a booking request, the availability of the chosen model will be confirmed by email, phone or WhatsApp by one of our representatives.",
        "2.3. Please note that submitting a booking request does not constitute a firm reservation of that vehicle.",
      ],
    },
    {
      title: "III. GENERAL RENTAL CONDITIONS",
      blocks: [
        "3.1. The car rental fee in Cluj, the full SCDW insurance or the rental deposit are paid in advance, either when the booking is confirmed or when you pick up the vehicle. The minimum rental period is one (1) day, except during holiday periods such as Easter, Christmas, New Year's Eve and the summer season (June to September), when the minimum rental period is 10 (ten) days.",
        "3.2. The minimum rental age is 23 years, and drivers must have held a driving licence for at least two years. Otherwise, we reserve the right to cancel your booking without any further consequences for the company.",
        "3.3. Any change to the contract details must be expressly communicated by the customer, no later than 24 hours from the time the car is picked up.",
        "3.4. During very busy periods, we reserve the right to request a deposit of 10% of the total rental value. This deposit is non-refundable if the customer cancels the booking or does not show up to pick up the vehicle at the time and location set in the booking confirmation. Also, if full payment was chosen when confirming the booking, only 10% of the total amount for the rental period will be retained if the booking is cancelled.",
        "3.5. Invoicing in RON is done at the BNR (National Bank of Romania) selling rate +1% on the day the Contract is signed.",
        "3.6. In case of late payment beyond the term stipulated in the Contract, the Company is entitled to charge penalties of 3% of the amount owed for each day of delay.",
        "3.7. During extremely busy periods, due to the high volume of requests and unforeseen situations such as accidents or technical failures, we reserve the right to offer you a model similar to the one originally chosen. Your refusal to accept the offered model does not oblige us to refund the deposit paid.",
        "3.8. The customer is responsible for returning the vehicle in the same condition in which it was picked up, including all documents and accessories provided at the time of rental. The vehicle must be returned with a full tank and cleaned both inside and out. If you cannot return the vehicle clean, a cleaning fee of 10 euros will apply, and for premium vehicles and minivans the fee will be 18 euros.",
        "3.9. Any delay beyond the time set in the contract will be charged as a full rental day for the first 2 hours. Exceeding the time specified in the contract by more than 2 hours will be reported to the police and charged between 100 and 300 euros, depending on the value of the vehicle. An exception to the above paragraph can only be made if it is explicitly stated in the contract and signed by both parties.",
        "3.10. The rental rate covers an average of 200 km/day. Additional kilometres will be charged at 5 EUR/50 km for the standard and business classes and 8 EUR/50 km for the premium class. If the vehicle is returned with less fuel than at the time of rental, a fee of 2.5 EUR/litre will apply.",
        "3.12. Loss or destruction of the vehicle keys will be charged between 200 and 700 EUR, and loss or destruction of the vehicle documents will be charged 100 EUR.",
        "3.13. Under certain conditions, the vehicles may be driven outside Romania, but only in EU member states. This must be notified when the booking is confirmed and involves a fee of 50 EUR per trip abroad, required to extend the insurance territorially and to issue driving authorisations for the drivers.",
        "3.14. Additional charges: Any fines, flat tyres, road or parking fees, etc., as well as the cost of any repairs during the rental period resulting from the renter's actions, will be borne by the renter. In addition, if, through the renter's fault, the car can no longer be driven on its own wheels following an accident, by signing this contract the customer agrees to cover the cost of transporting it on a tow truck back to the location where it was rented.",
      ],
    },
    {
      title: "IV. DEPOSIT AND SCDW INSURANCE",
      blocks: [
        "4.1. When picking up the vehicle, the customer agrees to a deposit of between 200 and 1800 EUR being blocked (depending on the value of the rented car), either on a bank card or in cash. This amount will be fully refunded if the customer returns the vehicle undamaged, clean and with all accessories, at the place, date and time agreed in the contract, or by paying for SCDW (Super Collision Damage Waiver) insurance, calculated based on the number of days and the class of the rented vehicle.",
        "4.2. The rental deposit will be charged at the start of the rental period or blocked on the bank card and released when the vehicle is returned in the same condition as at pick-up. If the vehicle is returned very dirty, we reserve the right to keep the deposit blocked until the vehicle has been cleaned and its return condition has been accurately established. If the vehicle is returned with damage or missing accessories, the rental deposit will be retained partially or in full. The deposit only partially covers total loss. In that case, the customer agrees to pay between 1000 and 8000 EUR depending on the rented model.",
        "4.3. SCDW insurance is a supplementary insurance protecting against damage and possible incidents caused by the customer or a third party. It releases the customer from financial liability for damage and reduces the deposit to zero. SCDW insurance only partially covers total loss. In that case, the customer agrees to pay between 1000 and 8000 EUR depending on the rented model.",
        "4.4. SCDW insurance does not cover fuel consumed, damage to the tyres and the underside of the vehicle (chassis, engine block, oil sump, gearbox) caused by deliberate or negligent action, or the loss of vehicle accessories.",
        "Both SCDW insurance and the rental deposit only cover the persons listed in the contract as entitled to drive the rented vehicle.",
      ],
    },
    {
      title: "V. CUSTOMER OBLIGATIONS",
      blocks: [
        "5.1. The customer is responsible for immediately notifying the rental agency of any observations regarding the condition of the vehicle at pick-up. If they notice anything suspicious or abnormal operating signs that could affect the condition or safety of the rented vehicle, they must stop the journey and inform the Company's representative.",
        "5.2. By signing the rental contract, the Customer agrees to comply with the following general conditions of use of the car:",
        {
          list: [
            "a. Comply with all Romanian road traffic laws in force.",
            "b. Notify the rental company before taking the car outside the country.",
            "c. Not lend the car to other persons who are not listed in the contract.",
            "d. Not sublet the car to third parties.",
            "e. Not overload the car (in terms of both number of seats and weight) beyond the maximum limits set out in the registration certificate.",
            "f. Not use the vehicle in competitions, car tests or other similar activities.",
            "g. Have the vehicle repaired only at service centres approved by the owner.",
            "h. Make sure the vehicle is not left unlocked, with the keys in the ignition or with the windows/boot open.",
            "i. Drive the vehicle only on public roads; use on forest roads is prohibited.",
            "j. Not push or tow other vehicles, caravans or other objects.",
            "k. Not drive under the influence of alcohol, narcotics or any other substance that could affect the driver's ability or concentration.",
            "l. Present the original valid driving licence together with an identity document.",
            "m. Not drive the vehicle off public roads, on unpaved or unsurfaced roads, or on roads closed to public traffic.",
            "n. Not carry out or allow technical or cosmetic interventions on the vehicle without the Company's written consent.",
            "o. When requested, inform the Company of the vehicle's location and allow it to be examined by the Company's representatives within a maximum of 12 hours of the request.",
            "p. Not use the vehicle for taxi services, ride-sharing (for example: Uber, Bolt, BlaBlaCar, etc.), driving schools, towing, racing, training, competitions, transport of hazardous substances or other illegal activities that could damage the vehicle. If the rented vehicle is confiscated or damaged by the authorities or by the customer through its use for illegal purposes, the customer is responsible for paying the full value of the vehicle as paid by the Company when purchasing it.",
            "q. The customer must keep the vehicle in proper working condition for the entire duration of the contract and return it in the same condition in which it was picked up. In case of any damage to the vehicle during the contract (including damage caused by collisions with animals or damage by an unknown party), the customer must bear the cost of all repairs needed to restore the vehicle to its condition at pick-up, following the procedure described in section VII. Otherwise, the customer will be liable for the full value of the repairs, the downtime costs and the expenses resulting from the loss of use of the car.",
          ],
        },
        "5.3. For failure to comply with the obligations listed in this article, the Company may retain the advance payments collected and the security deposit, including in the case of SCDW fees.",
      ],
    },
    {
      title: "VI. COMPANY OBLIGATIONS",
      blocks: [
        "6.1. To grant the Customer the right to use the vehicle that is the subject of the Contract by: delivering the vehicle, completing the handover details, and handing over the keys and the car documents (registration certificate, RCA insurance policy) as originals or copies.",
        "6.2. To provide the Customer with roadside assistance within Romania for the entire duration of the contract in case of an accident or mechanical breakdown (technical failure). The Company is not responsible for repairing tyres in case of a puncture.",
        "6.3. The Company is not responsible for losses incurred by the Customer in case of a breakdown or damage to the vehicle, except for repair expenses authorised by the Company.",
        "6.4. From the moment the vehicle is delivered until it is back in its possession, the Company is released from liability for damage caused in traffic by the vehicle rented to the Customer, as well as for road or bridge tolls or fines resulting from improper parking, breaches of traffic legislation or of Romanian law.",
      ],
    },
    {
      title: "VII. CUSTOMER OBLIGATIONS IN CASE OF DAMAGE AND ACCIDENTS",
      blocks: [
        "7.1. It is the customer's responsibility to immediately inform the Company of any new damage discovered on the rented vehicle.",
        "7.2. If the damage is caused by an unknown party, the customer must first obtain a Repair Authorisation from the competent authorities.",
        "7.3. If the accident is the customer's fault and two vehicles are involved:",
        {
          list: [
            "The customer must fill in the joint accident report form if both parties acknowledge fault.",
            "In the absence of an amicable agreement, a police report must be completed and a Repair Authorisation obtained from the competent authorities.",
          ],
        },
        "7.4. If the accident is not the customer's fault and two vehicles are involved:",
        {
          list: [
            "The customer must fill in the joint accident report form if both parties acknowledge fault.",
            "Copies of the at-fault party's RCA insurance, Registration Certificate, Identity Card and Driving Licence must also be provided.",
            "If no amicable agreement is reached, those copies must be presented together with the police report and the Repair Authorisation from the competent authorities.",
          ],
        },
        "7.5. If more than two vehicles are involved or there are bodily injuries, the customer must immediately contact the authorities to obtain a police report and a Repair Authorisation.",
        "7.6. If the vehicle is involved in an incident in which an animal is hit, the customer must immediately notify the competent authorities.",
        "7.7. The customer must check that the joint accident report form, the Repair Authorisation and the police report issued by the authorities have been filled in correctly in all the cases mentioned above.",
        "7.8. If the customer does not follow the damage procedure, they will be responsible for all costs related to repairs, vehicle downtime and loss of use of the car.",
        "7.9. Any damage occurring during the rental period will be invoiced, including scratches and other minor damage.",
      ],
    },
    {
      title: "VIII. FORCE MAJEURE",
      blocks: [
        "8.1. The Company will not be responsible for delays or inability to fulfil its contractual obligations due to force majeure, including but not limited to earthquakes, floods, fires, armed conflicts, strikes, embargoes or other circumstances beyond its control. In such situations, the company will make every reasonable effort to minimise the impact on customers and will properly communicate any changes to the provision of services.",
        "8.2. If force majeure or other unforeseeable circumstances beyond the company's control make it impossible to perform the contract, the parties will be released from their obligations without either party being liable to the other for damages or other compensatory obligations.",
      ],
    },
    {
      title: "IX. INTELLECTUAL PROPERTY RIGHTS",
      blocks: [
        "9.1 Everything posted on the Site and on various types of media, such as, but not limited to, images, texts, graphic elements, symbols, logos, databases, etc., is the property of the Company. All of these are protected by intellectual property law.",
        "9.2 Visitors and Third Parties may not use, copy, distribute, publish or incorporate such marks/information into other documents or materials in any form for the purpose of generating revenue without the prior express written permission of the Company.",
      ],
    },
    {
      title: "X. PROVIDING INFORMATION / FRAUD ATTEMPTS",
      blocks: [
        "10.1 In order to use the Site, Site users agree to provide truthful information about themselves.",
        "10.2 Any attempt to provide false information, to access another user's personal data, to modify the content of the Site or to affect the performance of the server hosting the Site will be considered an attempt to defraud the Company's systems and will result in access being blocked immediately. The Company also reserves the right to notify the competent authorities of such an attempt.",
        "10.3. The Company cannot be held responsible for any consequences resulting from its website not working, including, but not limited to, its temporary or permanent unavailability, software bugs, programming errors, or other technical problems that may affect access to or use of the online platform. The user accepts that the company makes every reasonable effort to keep the website working properly but cannot guarantee the complete absence of such technical problems. To the extent permitted by law, the company will not be liable to the customer or any other party for damage or losses suffered as a result of such technical incidents related to the website.",
        "10.4. This Site may include links to other internet platforms. We do not endorse other websites and are not responsible for the information, materials, products or services contained in or accessible through those websites. Access to and use of other websites is entirely at your own risk.",
      ],
    },
    {
      title: "XI. DISPUTES",
      blocks: [
        "11.1 Any dispute between the Company and its customers will be settled amicably. If this is not possible, disputes will fall under the jurisdiction of the Romanian courts in Cluj-Napoca.",
        "11.2 The applicable law is Romanian law.",
        "11.3. The Customer is automatically in default for all obligations assumed in the Contract that are not fulfilled by the deadlines set or communicated.",
        "11.4. For any dispute, these T&C constitute evidence.",
      ],
    },
    {
      title: "XII. FINAL PROVISIONS",
      blocks: [
        "12.1 The T&C represent the Contract between the consumer and the Company and may be assigned by the latter without the customer's consent.",
        "12.2. Chapter names and subheadings are for reference only and must not be taken into account in interpreting or construing these T&C.",
        "12.3. If any clause of these T&C is declared null or unenforceable, the remaining clauses will continue to have effect, and the clause declared null or unenforceable will be replaced by a new clause that reflects the Company's intent as closely as possible.",
      ],
    },
  ],
  contact: {
    title: "Contact Information",
    emailLabel: "Email",
    phoneLabel: "Phone",
    addressLabel: "Address",
    address:
      'Cluj "Avram Iancu" International Airport, Strada Traian Vuia 149-151, Cluj-Napoca, Romania',
  },
  lastUpdated: "Terms and conditions last updated: January 2024",
  acknowledgement:
    "By using our services, you acknowledge that you have read and understood these terms and conditions.",
};

export const TERMS_CONTENT: Record<Locale, TermsContent> = { ro, en };
