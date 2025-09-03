import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layout/page-layout";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function TermsAndConditionsPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            TERMENI SI CONDITII
          </h1>
        </div>

        <Separator className="mb-8" />

        {/* I. DISPOZIŢII GENERALE */}
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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

        <Separator className="my-8" />

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Informații de Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Rent&apos;n Go Prodexa S.R.L.</strong></p>
            <p>Email: <Link href="mailto:office@rngo.ro" className="text-primary hover:underline">office@rngo.ro</Link></p>
            <p>Telefon: +40773932961</p>
            <p>Adresă: Cluj "Avram Iancu" International Airport, Strada Traian Vuia 149-151, Cluj-Napoca, România</p>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Termeni și condiții actualizați ultima dată: Ianuarie 2024
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Prin utilizarea serviciilor noastre, recunoașteți că ați citit și înțeles acești termeni și condiții.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
