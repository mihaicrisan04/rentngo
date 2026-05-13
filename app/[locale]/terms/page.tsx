import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "/terms",
    title: {
      ro: "Termeni și Condiții",
      en: "Terms and Conditions",
    },
    description: {
      ro: "Termeni și condiții pentru închirierea de mașini cu Rent'n Go Cluj-Napoca. Citiți condițiile generale de închiriere auto.",
      en: "Terms and conditions for car rental with Rent'n Go Cluj-Napoca. Read the general car rental conditions.",
    },
  });
}

export default async function TermsAndConditionsPage({ params }: TermsPageProps) {
  const { locale } = await params;

  if (locale === "en") {
    return <TermsAndConditionsEn />;
  }
  return <TermsAndConditionsRo />;
}

function TermsAndConditionsRo() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex justify-center mb-5">
            <div className="accent-line"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight">
            TERMENI SI CONDITII
          </h1>
        </div>

        <div className="section-divider mb-10"></div>

        {/* I. DISPOZIŢII GENERALE */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">I. DISPOZIŢII GENERALE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              1.1. Termenii și Condițiile (denumite în continuare T&amp;C) reglementează funcționarea platformei de
              închirieri www.rngo.ro (denumită în continuare Site-ul), deținută de societatea RENT&apos;N GO PRODEXA
              S.R.L. , persoană juridică română cu sediul în Sat Florești, strada Tăuțului, Nr.214D, Jud. Cluj,
              înregistrată la Registrul Comerțului de pe lângă Tribunalul Cluj sub nr. J12/1445/2024, având C.U.I.
              49799254 (denumită în continuare Societatea). T&amp;C sunt concepute pentru a oferi informații relevante
              despre serviciile de închiriere.
            </p>
            <p>
              1.2. Prin utilizarea și/sau rezervarea unui autovehicul de pe acest Site și nu numai, vă supuneți în
              totalitate acestor Termeni și Condiții, precum și legislației din România.
            </p>
            <p>
              1.3. Navigând pe acest site și/sau efectuând rezervarea unui autovehicul pe www.rngo.ro, declarați că
              ați înțeles și acceptat prezentele Termeni și Condiții, precum și Politica de Confidențialitate.
            </p>
            <p>
              1.4. T&amp;C sunt valabile pe o perioadă nedeterminată. Utilizatorii înțeleg că Societatea are dreptul de a le
              modifica unilateral fără notificare prealabilă către aceștia. Orice modificări vor intra în vigoare imediat
              după publicarea lor pe Site. Utilizatorii sunt îndemnați să monitorizeze eventualele modificări.
            </p>
          </CardContent>
        </Card>

        {/* II. DESCRIEREA SERVICIILOR */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">II. DESCRIEREA SERVICIILOR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              2.1. RENT&apos; N GO PRODEXA este o companie de închirieri auto care vă pune la dispoziție autoturisme
              în stare optimă de funcționare, curate atât în interior, cât și în exterior. Prin semnarea contractului de
              închiriere, vă exprimați acordul cu termenii și condițiile, precum și cu politica de confidențialitate a
              companiei.
            </p>
            <p>
              2.2. Toate modelele de autoturisme prezentate pe site reflectă gama existentă în flota noastră, dar
              afișarea acestora nu garantează disponibilitatea în timpul solicitării dvs. După plasarea unei cereri de
              rezervare, disponibilitatea modelului ales va fi confirmată prin e-mail, telefon sau WhatsApp de către
              unul dintre reprezentanții noștri.
            </p>
            <p>
              2.3. Vă reamintim că transmiterea unei cereri de rezervare nu constituie o rezervare fermă a
              autoturismului respectiv.
            </p>
          </CardContent>
        </Card>

        {/* III. CONDIȚII GENERALE DE ÎNCHIRIERE */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">III. CONDIȚII GENERALE DE ÎNCHIRIERE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              3.1. Taxa pentru închirierea mașinilor în Cluj, asigurarea completă SCDW sau garanția de închiriere se
              plătesc în avans, fie la confirmarea rezervării, fie la preluarea autoturismului de către dumneavoastră.
              Perioada minimă de închiriere este de o (1) zi, cu excepția perioadelor de sărbători precum Paștele,
              Crăciunul, Revelionul și perioada de vară(din luna Iunie până în Septembrie) când perioada minimă de
              închiriere este de 10 (zece) zile.
            </p>
            <p>
              3.2. Vârsta minimă pentru închiriere este de 23 de ani, iar conducătorii auto trebuie să dețină permisul
              de conducere de cel puțin doi an. În caz contrar, ne rezervăm dreptul de a anula comanda
              dumneavoastră, fără a implica alte consecințe asupra firmei.
            </p>
            <p>
              3.3. Orice modificare a datelor din contract trebuie comunicată expres de către client, însă nu mai târziu
              de 24 de ore de la momentul preluării mașinii.
            </p>
            <p>
              3.4. În perioadele foarte aglomerate, ne rezervăm dreptul de a solicita un avans de 10% din valoarea
              totală a închirierii. Acest avans este nereturnabil în cazul în care clientul anulează rezervarea sau nu se
              prezintă pentru preluarea autoturismului la ora și locația stabilite în confirmarea rezervării. De
              asemenea, în cazul în care a fost aleasă plata integrală la confirmarea rezervării, în cazul anulării
              rezervării, se va reține doar 10% din suma totală a perioadei de închiriere.3.5. Facturarea in RON se face la cursul de vanzare al BNR +1% din ziua semnarii Contractului.
            </p>
            <p>
              3.6. In cazul intarzierii platii, peste termenul stipulat in Contract, Societatea are dreptul de a percepe
              penalitati in valoare de 3%, din valoarea sumei datorate, pentru fiecare zi de intarziere.
            </p>
            <p>
              3.7. În perioadele extrem de aglomerate, din cauza volumului mare de cereri și a situațiilor neprevăzute
              precum accidentele sau defectele tehnice, ne rezervăm dreptul de a vă oferi un model similar celui ales
              inițial. Refuzul dumneavoastră de a accepta modelul oferit nu atrage obligația noastră de a vă returna
              avansul plătit.
            </p>
            <p>
              3.8. Clientul este responsabil să returneze autoturismul în aceeași stare în care a fost preluat, inclusiv
              toate documentele și accesoriile furnizate în momentul închirierii. Autoturismul trebuie să fie returnat cu
              rezervorul plin și să fie curățat atât în interior, cât și în exterior. În cazul în care nu puteți returna
              autoturismul curat, va fi aplicată o taxă de spălare în valoare de 10 euro, iar pentru autoturismele
              premium și Mini-vanuri, taxa va fi de 18 euro.
            </p>
            <p>
              3.9. Orice întârziere care depășește ora stabilită în contract va fi taxată cu o zi întreagă de închiriere
              pentru primele 2 ore. Orice depășire a orei specificate în contract cu peste 2 ore va fi raportată poliției
              și va fi taxată cu sume între 100 și 300 euro, în funcție de valoarea autoturismului. O excepție pentru
              paragraful de mai sus poate fi făcută doar în situația în care este menționată în mod explicit în contract
              și este semnată de ambele părți.
            </p>
            <p>
              3.10. Tariful de închiriere acoperă o medie de 200 km/zi. Kilometrii suplimentari vor fi taxați cu 5
              EUR/50km pentru clasele standard și business și cu 8 EURO/50km pentru clasa premium. În cazul în
              care autoturismul este returnat cu o cantitate mai mică de combustibil față de momentul închirierii, se va
              aplica o taxă de 2.5 EUR/litru.
            </p>
            <p>
              3.12. Pierderea sau distrugerea cheilor autoturismului va fi taxată între 200 și 700 EUR, iar pierderea
              sau distrugerea documentelor autoturismului va fi taxată cu 100 EUR.
            </p>
            <p>
              3.13. În anumite condiții, este posibilă conducerea autoturismelor în afara granițelor României, însă doar
              în țările membre ale UE. Acest aspect trebuie notificat la confirmarea rezervării și implică o taxă de 50
              EUR/ieșire, necesară extinderii teritoriale a asigurărilor și emiterii imputernicirilor de conducere pentru
              șoferi.
            </p>
            <p>
              3.14. Taxe suplimentare: Orice amendă, pene de cauciuc, taxă de drum sau de parcare etc., precum și
              contravaloarea eventualelor reparații pe perioada închirierii, rezultate din acțiunile chiriașului, vor fi suportate de către acesta. În plus, în cazul în care, din vina chiriașului, mașina nu mai poate fi condusă
              pe propriile roți în urma unui accident, prin semnarea acestui contract, clientul se obligă să acopere
              cheltuielile cu transportul acesteia pe o platformă până la sediul de unde a închiriat-o.
            </p>
          </CardContent>
        </Card>

        {/* IV. GARANTIA ȘI ASIGURAREA SCDW */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">IV. GARANTIA ȘI ASIGURAREA SCDW</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              4.1. În momentul preluării autoturismului, clientul este de acord cu blocarea unei garanții cuprinse între
              200 și 1800 EUR (în funcție de valoarea mașinii închiriate), fie prin intermediul unui card bancar, fie în
              numerar. Această sumă va fi restituită integral în cazul în care clientul returnează autoturismul în stare
              nevătămată, curat și cu toate accesoriile, la locul, data și ora convenite în contract, sau prin achitarea
              asigurării SCDW (Super Collision Damage Waiver), calculată în funcție de numărul de zile și clasa
              autoturismului închiriat.
            </p>
            <p>
              4.2. În cazul garanției de închiriere, aceasta va fi percepută la începutul perioadei de închiriere sau
              blocată pe cardul bancar și ulterior deblocată la restituirea autoturismului în aceleași condiții ca la preluare. În situația în care autoturismul este returnat foarte murdar, ne rezervăm dreptul de a bloca această garanție până la curățarea autoturismului și stabilirea exactă a stării de returnare. În cazul în
              care autoturismul este returnat cu daune sau lipsă de accesorii, garanția de închiriere va fi reținută parțial
              sau integral. Garnția acoperă parțial situația daunelor totale. În această situație, clientul se obligă să
              achite între 1000 și 8000 EUR în funcție de modelul închiriat.
            </p>
            <p>
              4.3. Asigurarea SCDW este o asigurare complementară pentru protecția împotriva daunelor și
              evenimentelor posibile produse din vina clientului sau a unei terțe persoane. Aceasta exonerează
              clientul de răspunderea financiară în cazul daunelor și reduce la zero valoarea garanției. Asigurarea SCDW acoperă parțial situația daunelor totale. În această situație, clientul se obligă să achite între 1000
              și 8000 EUR în funcție de modelul închiriat.
            </p>
            <p>
              4.4. Asigurarea SCDW nu acoperă combustibilul consumat, daunele aduse anvelopelor și părții
              inferioare a autovehiculului (sasiu, bloc motor, baie de ulei, cutie de viteze) datorate unei acțiuni
              deliberare sau neglijente, precum și în cazul pierderii accesoriilor autoturismului.
            </p>
            <p>
              Atât asigurarea SCDW, cât și garanția de închiriere acoperă doar persoanele înscrise în contract cu
              dreptul de a conduce autoturismul închiriat.
            </p>
          </CardContent>
        </Card>

        {/* V. OBLIGATIILE CLIENTULUI */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">V. OBLIGATIILE CLIENTULUI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              5.1. Clientul este responsabil să notifice imediat agenția rent a car despre orice observații referitoare la starea autoturismului în momentul preluării acestuia. În cazul în care observă aspecte suspecte sau
              semne anormale de funcționare care ar putea afecta starea sau siguranța autoturismului închiriat, este
              obligat să oprească călătoria și să informeze reprezentantul firmei Societății.
            </p>
            <p>
              5.2. Prin semnarea contractului de închiriere, Clientul se angajează să respecte următoarele condiții
              generale de utilizare a mașinii:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>a. Respectarea tuturor legilor românești în vigoare referitoare la circulația rutieră.</li>
              <li>b. Anunțarea firmei de închirieri înainte de a scoate mașina în afara țării.</li>
              <li>c. Abținerea de la împrumutarea mașinii altor persoane care nu sunt înscrise în contract.</li>
              <li>d. Abținerea de la subînchirierea mașinii către terți.</li>
              <li>e. Evitarea supraîncărcării mașinii (atât în ceea ce privește numărul de locuri, cât și greutatea) peste limitele maxime prevăzute în talonul de înmatriculare.</li>
              <li>f. Abținerea de la utilizarea autovehiculului în competiții, teste auto sau alte activități de acest gen.</li>
              <li>g. Efectuarea reparațiilor autovehiculului doar în service-urile agreate de proprietar.</li>
              <li>h. Asigurarea că autovehiculul nu este lăsat descuiat, cu cheile în contact sau cu geamurile/portbagajul deschise.</li>
              <li>i. Conducerea autovehiculului doar pe drumurile publice, fiind interzisă utilizarea acestuia pe drumuri forestiere.</li>
              <li>j. Abținerea de la împingerea sau tractarea altor vehicule, rulote sau alte obiecte.</li>
              <li>k. Abținerea de la conducerea sub influența băuturilor alcoolice, narcoticelor sau oricărei alte substanțe care ar putea afecta capacitatea sau starea de concentrare a șoferului.</li>
              <li>l. Să prezinte originalul permisului de conducere valabil împreună cu un act de identitate.</li>
              <li>m. Să nu conducă autovehiculul în afara drumurilor publice, pe drumuri nepavate, neasfaltate sau închise circulației publice.</li>
              <li>n. Nu efectuează sau permite intervenții tehnice sau estetice asupra autovehiculului fără consimțământul scris al Societății.</li>
              <li>o. În cazul solicitării, informează Societatea despre locația autovehiculului și permite examinarea acestuia de către reprezentanții Societății în maxim 12 de ore de la cerere.</li>
              <li>p. Nu utilizează autovehiculul pentru taximetrie, transport alternativ (de exemplu: Uber, Bolt, Bla Bla Car etc.), școli de șoferi, activități de tractare, curse, antrenamente, concursuri, transport de substanțe periculoase sau alte activități ilegale care ar putea deteriora starea autovehiculului. În cazul în care autoturismul închiriat este confiscat sau deteriorat de autorități sau de client prin utilizarea sa în scopuri ilegale, clientul este responsabil pentru achitarea contravaloarii completă a autovehiculului pe care scietatea l-a achitat la achiziționarea acestuia .</li>
              <li>q. Clientul are obligația de a menține autovehiculul într-o stare corespunzătoare de funcționare pe întreaga durată a contractului și de a-l preda înapoi în aceeași stare în care a fost preluat. În cazul oricăror daune produse autovehiculului pe durata contractului (inclusiv daune cauzate de coliziuni cu animale sau daune de autor necunoscut), clientul este obligat să suporte costurile tuturor reparațiilor necesare pentru a restabili starea autovehiculului la cea existentă la momentul preluării, cu respectarea procedurii descrise la punctul VII. În caz contrar, clientul va fi responsabil pentru întreaga valoare a reparațiilor, costurile de imobilizare și cheltuielile generate de lipsa de folosință a mașinii.</li>
            </ul>
            <p>
              5.3. Pentru nerespectarea obligațiilor enumerate în acest articol Societatea poate să rețină avansurilor
              încasate, depozitul de garanție, inclusiv în cazul taxelor SCDW.
            </p>
          </CardContent>
        </Card>

        {/* VI. OBLIGATIILE SOCIETĂȚII */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">VI. OBLIGATIILE SOCIETĂȚII</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              6.1. Sa transmita Clientului dreptul de folosinta asupra autovehiculului ce constituie obiectul Contractului
              prin: livrarea autovehiculului, completarea datelor de predare-preluare, inmanarea cheilor si a actelor
              masinii (certificat de inmatriculare, polita de asigurare RCA) in original sau copie.
            </p>
            <p>
              6.2. Sa asigure Clientului asistenta rutiera, pe teritoriul Romaniei, pe toata durata contractului, in caz de
              accident sau pana mecanica (defectiune tehnica). Societatea nu este responsabila de remedierea
              anvelopei in caz de pana.
            </p>
            <p>
              6.3. Societatea nu este responsabila de pierderile suportate de catre Client in caz de defectare sau
              avarie a autovehiculului, cu exceptia cheltuielilor autorizate de Societate pentru reparatii.
            </p>
            <p>
              6.4. Din momentul livrarii autovehiculului si pana la reintrarea in posesia acestuia, Societatea este
              exonerata de raspundere pentru daunele provocate in trafic de autovehiculul inchiriat Clientului, precum
              si de taxele de drum ori de pod sau amenzi rezultate din ocuparea abuziva a unui loc de parcare,
              nerespectarea legislatiei rutiere sau a legilor Romaniei.
            </p>
          </CardContent>
        </Card>

        {/* VII. OBLIGAȚIILE CLIENTULUI ÎN CAZ DE AVARII ȘI ACCIDENTE */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">VII. OBLIGAȚIILE CLIENTULUI ÎN CAZ DE AVARII ȘI ACCIDENTE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>7.1. Este responsabilitatea clientului să informeze imediat Societatea despre orice nouă avarie
            descoperită la autovehiculul închiriat.</p>
            <p>7.2. În situația în care dauna este provocată de un autor necunoscut, clientul trebuie să obțină în
            prealabil Autorizația de Reparație de la autoritățile competente.</p>
            <p>7.3. În cazul în care accidentul implică vina clientului și sunt implicate două vehicule:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>· Clientul trebuie să completeze formularul de constatare amiabilă în cazul în care ambele părți recunosc vina.</li>
              <li>· În absența unui acord amiabil, este necesară completarea unui Proces Verbal și obținerea Autorizației de Reparație de la autoritățile competente.</li>
            </ul>
            <p>7.4. Dacă accidentul nu este din culpa clientului și sunt implicate două vehicule:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>· Clientul trebuie să completeze formularul de constatare amiabilă în cazul în care ambele părți recunosc vina.</li>
              <li>· De asemenea, trebuie furnizate copii ale RCA, Certificatului de Înmatriculare, Cărții de Identitate și Permisului de Conducere ale părții vinovate.</li>
              <li>· În cazul în care nu se ajunge la un acord amiabil, este necesară prezentarea copiilor respective, alături de Procesul Verbal și Autorizația de Reparație de la autoritățile competente.</li>
            </ul>
            <p>
              7.5. În cazul în care sunt implicate mai mult de două vehicule sau rezultă vătămări corporale, clientul
              trebuie să contacteze imediat autoritățile pentru a obține un Proces Verbal și o Autorizație de Reparație.
            </p>
            <p>
              7.6. Dacă autovehiculul este implicat într-un incident în care este lovit un animal, clientul trebuie să
              anunțe imediat autoritățile competente.
            </p>
            <p>
              7.7. Clientul are obligația de a verifica corectitudinea completării formularului de constatare amiabilă,
              Autorizației de Reparație și Procesului Verbal eliberate de autorități în toate cazurile menționate anterior.
            </p>
            <p>
              7.8. În cazul în care clientul nu respectă procedura în caz de daună, acesta va fi responsabil pentru
              toate costurile asociate reparațiilor, imobilizării vehiculului și pierderilor de utilizare a mașinii.
            </p>
            <p>
              7.9. Orice daună apărută în timpul perioadei de închiriere a autovehiculului va fi facturată, inclusiv
              zgârieturile și alte daune minore.
            </p>
          </CardContent>
        </Card>

        {/* VIII. FORȚA MAJORĂ */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">VIII. FORȚA MAJORĂ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              8.1. Societatea nu va fi responsabilă pentru întârzieri sau incapacitatea de a îndeplini obligațiile
              contractuale din cauza forței majore, inclusiv dar fără a se limita la cutremure, inundații, incendii, conflicte armate, greve, embargouri sau alte circumstanțe independente de voința sa. În astfel de situații,
              societatea își va depune toate eforturile rezonabile pentru a minimiza impactul asupra clienților și va
              comunica în mod corespunzător orice modificări în prestarea serviciilor.
            </p>
            <p>
              8.2. În cazul în care forța majoră sau alte circumstanțe imprevizibile și imposibile de controlat de către
              societate fac imposibilă executarea contractului, părțile vor fi eliberate de obligațiile lor fără ca vreo parte
              să fie răspunzătoare față de cealaltă pentru daune sau alte obligații compensatorii.
            </p>
          </CardContent>
        </Card>

        {/* IX. DREPTURI DE PROPRIETATE INTELECTUALĂ */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">IX. DREPTURI DE PROPRIETATE INTELECTUALĂ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              9.1 Tot ceea ce este postat pe Site precum și pe diverse tipuri de suporturi, cum ar fi, însă fără a se
              limita la, imagini, texte, elemente de grafică, simboluri, logo-uri, baze de date etc. este proprietatea
              Societății. Toate acestea cad sub incidența legislației în materie de proprietate intelectuală.
            </p>
            <p>
              9.2 Vizitatorii și Terții nu pot utiliza, copia, distribui, publica sau incorpora în alte documente sau
              materiale astfel de marcaje/informații sub nicio formă în scopul obținerii de venituri fără permisiunea
              prealabilă scrisă și expresă a Societății.
            </p>
          </CardContent>
        </Card>

        {/* X. FURNIZAREA DE INFORMAȚII/ TENTATIVE DE FRAUDĂ */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">X. FURNIZAREA DE INFORMAȚII/ TENTATIVE DE FRAUDĂ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              10.1 Pentru a utiliza Site-ul, utilizatorii Site-ului sunt de acord să furnizeze informații reale despre ei.
            </p>
            <p>
              10.2 Orice încercare de a furniza informații false, de a accesa datele personale ale altui utilizator, de a
              modifica conținutul Site-ului sau de a afecta performanțele serverului pe care este postat Site-ul, va fi
              considerată tentativă de fraudare a sistemelor Societății şi va duce la blocarea imediată a accesului. De
              asemenea, Societatea își rezervă dreptul de a anunța autoritățile competente despre această tentativă.
            </p>
            <p>
              10.3. Societatea nu poate fi făcută responsabilă pentru orice consecințe rezultate din nefuncționarea
              website-ului său, inclusiv, dar fără a se limita la, indisponibilitatea temporară sau permanentă a acestuia,
              bug-uri software, erori de programare, sau alte probleme tehnice care pot afecta accesul sau utilizarea
              platformei online. Utilizatorul acceptă că societatea depune toate eforturile rezonabile pentru a menține
              funcționarea corespunzătoare a website-ului, însă nu poate garanta lipsa totală a unor astfel de
              probleme tehnice. În măsura permisă de lege, societatea nu va fi responsabilă față de client sau orice
              altă parte pentru daunele sau pierderile suferite ca urmare a unor astfel de incidente tehnice legate de
              website.
            </p>
            <p>
              10.4. Acest Site poate include link-uri catre alte platforme de internet. Noi nu recomandam alte site-uri
              web si nu suntem raspunzatori pentru informatiile, materialele, produsele sau serviciile continute in sau
              accesibile prin intermediul acelor site-uri web. Accesul si utilizarea altor site-uri web se fac exclusiv pe
              propriul risc.
            </p>
          </CardContent>
        </Card>

        {/* XI. CONFLICTE */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">XI. CONFLICTE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              11.1 Orice conflict apărut între Societate și clienții săi se va soluționa pe cale amiabilă. În cazul în care
              acest lucru nu este posibil, soluționarea conflictelor este de competența instanțelor române din Cluj-
              Napoca.
            </p>
            <p>11.2 Legea aplicabilă este legea română.</p>
            <p>
              11.3. Clientul este pus de drept în întarziere pentru toate obligatiile asumate in Contract si nerespectate
              ca atare la termenele prevăzute sau comunicate.
            </p>
            <p>11.4. Pentru orice disputa, acești T&amp;C constituie o dovada.</p>
          </CardContent>
        </Card>

        {/* XII. PREVEDERI FINALE */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">XII. PREVEDERI FINALE</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              12.1 T&amp;C reprezintă Contractul dintre consumator și Societate, pot fi cesionate de către aceasta din
              urmă fără a fi necesar acordul clientului.
            </p>
            <p>
              12.2. Numele capitolelor și sub-titlurile sunt doar pentru referință și nu trebuie luate în considerare în
              interpretarea sau construcția prezentelor T&amp;C.
            </p>
            <p>
              12.3. În cazul declarării vreuneia din clauzele prezentul T&amp;C nulă sau inaplicabilă, restul clauzelor vor
              continua să își producă efectele, iar clauză declarată nulă sau inaplicabilă va fi înlocuită de o nouă clauză
              care să reflecte cât mai apropiat cu putință voința Societății.
            </p>
          </CardContent>
        </Card>

        <div className="section-divider my-10"></div>

        {/* Contact Information */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">Informații de Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Rent&apos;n Go Prodexa S.R.L.</strong></p>
            <p>Email: <Link href="mailto:office@rngo.ro" className="text-primary hover:underline">office@rngo.ro</Link></p>
            <p>Telefon: +40773932961</p>
            <p>Adresă: Cluj &quot;Avram Iancu&quot; International Airport, Strada Traian Vuia 149-151, Cluj-Napoca, România</p>
          </CardContent>
        </Card>

        <div className="section-divider my-10"></div>

        {/* Footer Note */}
        <div className="text-center pb-4">
          <p className="text-sm text-muted-foreground">
            Termeni și condiții actualizați ultima dată: Ianuarie 2024
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Prin utilizarea serviciilor noastre, recunoașteți că ați citit și înțeles acești termeni și condiții.
          </p>
        </div>
      </div>
  );
}

function TermsAndConditionsEn() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex justify-center mb-5">
          <div className="accent-line"></div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center tracking-tight">
          TERMS AND CONDITIONS
        </h1>
      </div>

      <div className="section-divider mb-10"></div>

      {/* I. GENERAL PROVISIONS */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">I. GENERAL PROVISIONS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            1.1. These Terms and Conditions (hereinafter referred to as the T&amp;C) govern the operation of the car rental platform www.rngo.ro (hereinafter referred to as the Website), owned by RENT&apos;N GO PRODEXA S.R.L., a Romanian legal entity with its registered office in Florești Village, Tăuțului Street, No. 214D, Cluj County, registered with the Trade Register under No. J12/1445/2024, having VAT Registration Number (C.U.I.) 49799254 (hereinafter referred to as the Company). The T&amp;C are intended to provide relevant information regarding the rental services.
          </p>
          <p>
            1.2. By using and/or booking a vehicle through this Website or otherwise, you fully agree to and are bound by these Terms and Conditions, as well as by the applicable legislation of Romania.
          </p>
          <p>
            1.3. By browsing this Website and/or making a vehicle reservation on www.rngo.ro, you declare that you have understood and accepted these Terms and Conditions, as well as the Privacy Policy.
          </p>
          <p>
            1.4. The T&amp;C are valid for an indefinite period. Users acknowledge that the Company has the right to modify them unilaterally without prior notice. Any changes shall take effect immediately upon their publication on the Website. Users are encouraged to regularly review any updates or modifications.
          </p>
        </CardContent>
      </Card>

      {/* II. DESCRIPTION OF SERVICES */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">II. DESCRIPTION OF SERVICES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            2.1. RENT&apos;N GO PRODEXA is a car rental company that provides vehicles in optimal working condition, clean both inside and outside. By signing the rental agreement, you expressly agree to the Company&apos;s Terms and Conditions as well as its Privacy Policy.
          </p>
          <p>
            2.2. All vehicle models displayed on the Website reflect the range available in our fleet; however, their display does not guarantee availability at the time of your request. After submitting a reservation request, the availability of the selected vehicle will be confirmed by one of our representatives via email, phone, or WhatsApp.
          </p>
          <p>
            2.3. Please note that submitting a reservation request does not constitute a confirmed reservation of the respective vehicle.
          </p>
        </CardContent>
      </Card>

      {/* III. GENERAL RENTAL CONDITIONS */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">III. GENERAL RENTAL CONDITIONS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            3.1. The rental fee for vehicles in Cluj, the full SCDW insurance, or the rental deposit must be paid in advance, either at the time of booking confirmation or upon vehicle pickup. The minimum rental period is one (1) day, except during holiday periods such as Easter, Christmas, New Year&apos;s Eve, and the summer season (from June to September), when the minimum rental period is ten (10) days.
          </p>
          <p>
            3.2. The minimum age for renting a vehicle is 23 years, and drivers must hold a valid driving license for at least two (2) years. Otherwise, we reserve the right to cancel your order without any further consequences for the Company.
          </p>
          <p>
            3.3. Any modification to the contract details must be expressly communicated by the client, no later than 24 hours from the moment of vehicle pickup.
          </p>
          <p>
            3.4. During very busy periods, we reserve the right to request an advance payment of 10% of the total rental value. This advance is non-refundable if the client cancels the reservation or fails to appear for vehicle pickup at the time and location specified in the booking confirmation. If full payment was selected at the time of booking confirmation, in the event of cancellation, only 10% of the total rental amount will be retained.
          </p>
          <p>
            3.5. Invoicing in RON is carried out at the National Bank of Romania (BNR) selling exchange rate plus 1%, applicable on the date of signing the Contract.
          </p>
          <p>
            3.6. In the event of late payment beyond the deadline stipulated in the Contract, the Company has the right to charge penalties amounting to 3% of the outstanding amount for each day of delay.
          </p>
          <p>
            3.7. During extremely busy periods, due to a high volume of requests and unforeseen situations such as accidents or technical malfunctions, we reserve the right to offer a vehicle similar to the one initially selected. Refusal to accept the offered vehicle does not oblige us to refund the advance payment made.
          </p>
          <p>
            3.8. The client is responsible for returning the vehicle in the same condition in which it was received, including all documents and accessories provided at the time of rental. The vehicle must be returned with a full fuel tank and clean both inside and outside. If the vehicle cannot be returned clean, a cleaning fee of 10 EUR will be applied; for premium vehicles and minivans, the fee will be 18 EUR.
          </p>
          <p>
            3.9. Any delay exceeding the return time specified in the contract will be charged as a full rental day for the first two (2) hours. Any delay exceeding the specified return time by more than two (2) hours will be reported to the police and charged between 100 and 300 EUR, depending on the value of the vehicle. An exception to the above may only be made if explicitly stated in the contract and signed by both parties.
          </p>
          <p>
            3.10. The rental rate includes an average allowance of 200 km per day. Additional kilometers will be charged at rates between 5 EUR per 50 km and 15 EUR per 50 km, depending on the rented vehicle model. If the vehicle is returned with a lower fuel level than at the time of pickup, a fee of 2.5 EUR per liter will be applied.
          </p>
          <p>
            3.12. Loss or destruction of the vehicle keys will be charged between 200 and 700 EUR, and loss or destruction of the vehicle documents will be charged 100 EUR.
          </p>
          <p>
            3.13. Under certain conditions, driving the vehicle outside the borders of Romania is permitted only within European Union member states. This must be notified at the time of booking confirmation and involves a fee of 50 EUR per exit, required for extending the territorial coverage of the insurance and issuing driving authorizations for the drivers.
          </p>
          <p>
            3.14. Additional fees: Any fines, tire punctures, road or parking fees, as well as the cost of any repairs during the rental period resulting from the renter&apos;s actions, shall be borne by the renter. Furthermore, if, due to the renter&apos;s fault, the vehicle can no longer be driven on its own wheels following an accident, by signing this contract the client agrees to cover the costs of transporting the vehicle on a recovery platform to the location from which it was rented.
          </p>
        </CardContent>
      </Card>

      {/* IV. DEPOSIT AND SCDW INSURANCE */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">IV. DEPOSIT AND SCDW INSURANCE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            4.1. At the time of vehicle pickup, the client agrees to the blocking or payment of a deposit ranging between 200 and 1,800 EUR (depending on the value of the rented vehicle), either by bank card or in cash. This amount will be fully refunded if the client returns the vehicle undamaged, clean, and with all accessories, at the location, date, and time agreed in the contract, or by purchasing the SCDW (Super Collision Damage Waiver) insurance, calculated based on the number of rental days and the class of the rented vehicle.
          </p>
          <p>
            4.2. In the case of the rental deposit, it will be charged at the beginning of the rental period or blocked on the client&apos;s bank card and subsequently released upon the return of the vehicle under the same conditions as at pickup. If the vehicle is returned excessively dirty, we reserve the right to retain the deposit until the vehicle has been cleaned and its return condition accurately assessed. If the vehicle is returned with damages or missing accessories, the rental deposit will be partially or fully retained. The deposit partially covers total loss situations. In such cases, the client undertakes to pay an amount between 1,000 and 8,000 EUR, depending on the rented vehicle model.
          </p>
          <p>
            4.3. The SCDW insurance is a supplementary insurance providing protection against damages and possible events caused by the client or by a third party. It releases the client from financial liability in the event of damages and reduces the deposit amount to zero. The SCDW insurance partially covers total loss situations. In such cases, the client undertakes to pay an amount between 1,000 and 8,000 EUR, depending on the rented vehicle model.
          </p>
          <p>
            4.4. The SCDW insurance does not cover consumed fuel, damage to tires, or damage to the lower part of the vehicle (chassis, engine block, oil pan, gearbox) resulting from deliberate or negligent actions, nor does it cover the loss of vehicle accessories.
          </p>
          <p>
            Both the SCDW insurance and the rental deposit apply only to the individuals listed in the contract as authorized drivers of the rented vehicle.
          </p>
        </CardContent>
      </Card>

      {/* V. CLIENT OBLIGATIONS */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">V. CLIENT OBLIGATIONS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            5.1. The Client is responsible for immediately notifying the car rental agency of any observations regarding the condition of the vehicle at the time of pickup. If the Client notices any suspicious issues or abnormal operating signs that may affect the condition or safety of the rented vehicle, the Client is obliged to stop the journey and inform a Company representative.
          </p>
          <p>
            5.2. By signing the rental agreement, the Client undertakes to comply with the following general conditions of vehicle use:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>a. To comply with all applicable Romanian laws regarding road traffic.</li>
            <li>b. To notify the rental company before taking the vehicle outside the country.</li>
            <li>c. To refrain from lending the vehicle to persons not listed in the contract.</li>
            <li>d. To refrain from sub-renting the vehicle to third parties.</li>
            <li>e. To avoid overloading the vehicle (both in terms of seating capacity and weight) beyond the maximum limits specified in the vehicle registration certificate.</li>
            <li>f. To refrain from using the vehicle in competitions, automotive tests, or similar activities.</li>
            <li>g. To carry out vehicle repairs only in service centers approved by the owner.</li>
            <li>h. To ensure that the vehicle is not left unlocked, with the keys in the ignition, or with the windows or trunk open.</li>
            <li>i. To drive the vehicle only on public roads; use on forest roads is prohibited.</li>
            <li>j. To refrain from pushing or towing other vehicles, trailers, or objects.</li>
            <li>k. To refrain from driving under the influence of alcohol, narcotics, or any other substances that may affect the driver&apos;s ability or level of concentration.</li>
            <li>l. To present the original valid driving license together with an identity document.</li>
            <li>m. Not to drive the vehicle outside public roads, on unpaved, non-asphalted roads, or roads closed to public traffic.</li>
            <li>n. Not to perform or allow any technical or aesthetic modifications to the vehicle without the Company&apos;s prior written consent.</li>
            <li>o. Upon request, to inform the Company of the vehicle&apos;s location and allow its inspection by Company representatives within a maximum of 12 hours from the request.</li>
            <li>p. Not to use the vehicle for taxi services, alternative transportation services (such as Uber, Bolt, BlaBlaCar, etc.), driving schools, towing activities, races, training sessions, competitions, transportation of hazardous substances, or any other illegal activities that may damage the condition of the vehicle. If the rented vehicle is confiscated or damaged by authorities or by the Client due to illegal use, the Client shall be responsible for paying the full value of the vehicle as paid by the Company at the time of its acquisition.</li>
            <li>q. The Client is obliged to maintain the vehicle in proper working condition throughout the duration of the contract and to return it in the same condition as at pickup. In the event of any damage to the vehicle during the rental period (including damage caused by collisions with animals or damage caused by unknown parties), the Client is required to bear the costs of all repairs necessary to restore the vehicle to its condition at the time of pickup, in accordance with the procedure described in Section VII. Otherwise, the Client shall be responsible for the full value of the repairs, immobilization costs, and expenses resulting from the loss of use of the vehicle.</li>
          </ul>
          <p>
            5.3. In the event of failure to comply with the obligations set forth in this section, the Company may retain any advance payments received, the security deposit, including any SCDW fees.
          </p>
        </CardContent>
      </Card>

      {/* VI. COMPANY OBLIGATIONS */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">VI. COMPANY OBLIGATIONS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            6.1. To grant the Client the right of use over the vehicle that is the subject of the Contract by delivering the vehicle, completing the handover documentation, and providing the vehicle keys and documents (vehicle registration certificate and RCA insurance policy), either in original or copy.
          </p>
          <p>
            6.2. To provide the Client with roadside assistance within the territory of Romania for the entire duration of the contract, in the event of an accident or mechanical breakdown (technical malfunction). The Company is not responsible for repairing the tire in the event of a puncture.
          </p>
          <p>
            6.3. The Company shall not be responsible for losses incurred by the Client in the event of vehicle malfunction or damage, except for repair costs expressly authorized by the Company.
          </p>
          <p>
            6.4. From the moment the vehicle is delivered until it is returned to the Company, the Company is released from liability for any damages caused in traffic by the vehicle rented to the Client, as well as for road or bridge tolls or fines resulting from improper parking, non-compliance with road traffic regulations, or violations of Romanian law.
          </p>
        </CardContent>
      </Card>

      {/* VII. CLIENT OBLIGATIONS IN CASE OF DAMAGES AND ACCIDENTS */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">VII. CLIENT OBLIGATIONS IN CASE OF DAMAGES AND ACCIDENTS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>7.1. It is the Client&apos;s responsibility to immediately inform the Company of any new damage discovered to the rented vehicle.</p>
          <p>7.2. In the event that the damage is caused by an unknown party, the Client must obtain a Repair Authorization from the competent authorities in advance.</p>
          <p>7.3. If the accident is caused by the Client and involves two vehicles:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>· The Client must complete the amicable accident report form if both parties acknowledge fault.</li>
            <li>· In the absence of an amicable settlement, a Police Report must be completed and a Repair Authorization must be obtained from the competent authorities.</li>
          </ul>
          <p>7.4. If the accident is not the Client&apos;s fault and involves two vehicles:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>· The Client must complete the amicable accident report form if both parties acknowledge fault.</li>
            <li>· Copies of the third party&apos;s RCA insurance, Vehicle Registration Certificate, Identity Card, and Driving License must also be provided.</li>
            <li>· If an amicable settlement cannot be reached, the above documents must be submitted together with the Police Report and the Repair Authorization issued by the competent authorities.</li>
          </ul>
          <p>
            7.5. If more than two vehicles are involved or if bodily injuries occur, the Client must immediately contact the authorities in order to obtain a Police Report and a Repair Authorization.
          </p>
          <p>
            7.6. If the vehicle is involved in an incident in which an animal is struck, the Client must immediately notify the competent authorities.
          </p>
          <p>
            7.7. The Client is obliged to verify the accuracy and completeness of the amicable accident report form, the Repair Authorization, and the Police Report issued by the authorities in all the cases mentioned above.
          </p>
          <p>
            7.8. If the Client fails to comply with the damage reporting procedure, the Client shall be responsible for all costs associated with repairs, vehicle immobilization, and loss of use of the vehicle.
          </p>
          <p>
            7.9. Any damage occurring during the rental period of the vehicle shall be invoiced, including scratches and other minor damages.
          </p>
        </CardContent>
      </Card>

      {/* VIII. FORCE MAJEURE */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">VIII. FORCE MAJEURE</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            8.1. The Company shall not be held liable for delays or failure to perform its contractual obligations due to force majeure events, including but not limited to earthquakes, floods, fires, armed conflicts, strikes, embargoes, or other circumstances beyond its control. In such situations, the Company shall make all reasonable efforts to minimize the impact on clients and shall appropriately communicate any changes in the provision of services.
          </p>
          <p>
            8.2. If force majeure or other unforeseen and uncontrollable circumstances make the performance of the contract impossible, the parties shall be released from their obligations, and neither party shall be liable to the other for damages or any other compensatory obligations.
          </p>
        </CardContent>
      </Card>

      {/* IX. INTELLECTUAL PROPERTY RIGHTS */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">IX. INTELLECTUAL PROPERTY RIGHTS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            9.1. All content posted on the Website, as well as on various types of media, including but not limited to images, texts, graphic elements, symbols, logos, databases, and similar materials, is the property of the Company. All such content is protected under applicable intellectual property legislation.
          </p>
          <p>
            9.2. Visitors and third parties may not use, copy, distribute, publish, or incorporate such materials or information into other documents or materials in any form for the purpose of generating revenue without the Company&apos;s prior written and express consent.
          </p>
        </CardContent>
      </Card>

      {/* X. INFORMATION PROVISION / FRAUD ATTEMPTS */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">X. INFORMATION PROVISION / FRAUD ATTEMPTS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            10.1. In order to use the Website, users agree to provide truthful and accurate information about themselves.
          </p>
          <p>
            10.2. Any attempt to provide false information, access another user&apos;s personal data, modify the content of the Website, or interfere with the performance of the server on which the Website is hosted shall be considered an attempt to defraud the Company&apos;s systems and will result in the immediate blocking of access. The Company also reserves the right to notify the competent authorities of such attempts.
          </p>
          <p>
            10.3. The Company shall not be held liable for any consequences resulting from the malfunction of its website, including but not limited to temporary or permanent unavailability, software bugs, programming errors, or other technical issues that may affect access to or use of the online platform. The user acknowledges that the Company makes all reasonable efforts to ensure the proper functioning of the website; however, it cannot guarantee the complete absence of such technical issues. To the extent permitted by law, the Company shall not be liable to the Client or any other party for damages or losses arising from such technical incidents related to the website.
          </p>
          <p>
            10.4. This Website may contain links to other internet platforms. We do not endorse other websites and are not responsible for the information, materials, products, or services contained in or accessible through such websites. Access to and use of other websites is carried out exclusively at the user&apos;s own risk.
          </p>
        </CardContent>
      </Card>

      {/* XI. DISPUTES */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">XI. DISPUTES</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            11.1. Any dispute arising between the Company and its clients shall be settled amicably. If an amicable resolution is not possible, the dispute shall fall under the jurisdiction of the Romanian courts in Cluj-Napoca.
          </p>
          <p>11.2. The applicable law shall be Romanian law.</p>
          <p>
            11.3. The Client shall be deemed in default by operation of law for all obligations assumed under the Contract that are not fulfilled within the agreed or communicated deadlines.
          </p>
          <p>11.4. For any dispute, these Terms and Conditions shall constitute proof.</p>
        </CardContent>
      </Card>

      {/* XII. FINAL PROVISIONS */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">XII. FINAL PROVISIONS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            12.1. These Terms and Conditions constitute the contract between the consumer and the Company and may be assigned by the Company without requiring the Client&apos;s consent.
          </p>
          <p>
            12.2. The titles of the sections and subsections are for reference purposes only and shall not be taken into account when interpreting or construing these Terms and Conditions.
          </p>
          <p>
            12.3. If any provision of these Terms and Conditions is declared null or unenforceable, the remaining provisions shall remain in full force and effect, and the null or unenforceable provision shall be replaced with a new provision that reflects, as closely as possible, the intent of the Company.
          </p>
        </CardContent>
      </Card>

      <div className="section-divider my-10"></div>

      {/* Contact Information */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Rent&apos;n Go Prodexa S.R.L.</strong></p>
          <p>Email: <Link href="mailto:office@rngo.ro" className="text-primary hover:underline">office@rngo.ro</Link></p>
          <p>Phone: +40 773 932 961</p>
          <p>Address: Cluj &quot;Avram Iancu&quot; International Airport, Traian Vuia Street 149–151, Cluj-Napoca, Romania</p>
        </CardContent>
      </Card>

      <div className="section-divider my-10"></div>

      {/* Footer Note */}
      <div className="text-center pb-4">
        <p className="text-sm text-muted-foreground">
          Terms and conditions last updated: January 2024
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          By using our services, you acknowledge that you have read and understood these terms and conditions.
        </p>
      </div>
    </div>
  );
}
