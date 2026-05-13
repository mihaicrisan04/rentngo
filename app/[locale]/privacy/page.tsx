import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;

  return buildMetadata({
    locale,
    path: "/privacy",
    title: {
      ro: "Politica de Confidențialitate",
      en: "Privacy Policy",
    },
    description: {
      ro: "Politica de confidențialitate Rent'n Go. Informații despre colectarea și prelucrarea datelor cu caracter personal conform GDPR.",
      en: "Rent'n Go Privacy Policy. Information about personal data collection and processing in accordance with GDPR.",
    },
  });
}

export default async function PrivacyPolicyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;

  if (locale === "en") {
    return <PrivacyPolicyEn />;
  }
  return <PrivacyPolicyRo />;
}

function PrivacyPolicyRo() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex justify-center mb-5">
            <div className="accent-line"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-5 tracking-tight">
            Politică de confidențialitate
          </h1>
          <h2 className="text-lg text-muted-foreground text-center leading-relaxed max-w-3xl mx-auto">
            INFORMARE PRIVIND COLECTAREA DATELOR CU CARACTER PERSONAL PENTRU PERSOANE FIZICE ȘI REPREZENTANȚI LEGALI/PERSOANA DE CONTACT A PERSOANELOR JURIDICE
          </h2>
        </div>

        <div className="section-divider mb-10"></div>

        {/* Introduction */}
        <div className="mb-8">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Următoarea informare este concepută pentru a vă aduce la cunoștință cele mai importante aspecte cu privire la prelucrarea datelor dvs. cu caracter personal și la drepturile dvs. privind aceasta prelucrare în conformitate cu Regulamentul general privind protecția datelor 2016/679 (GDPR) și legislația națională aplicabilă.
          </p>
        </div>

        <div className="section-divider mb-10"></div>

        {/* Section 1 */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">1. Informații generale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Protecția datelor dvs. cu caracter personal este importantă pentru noi, motiv pentru care am aderat la principii stricte în această privință.
            </p>
            <p>
              Atunci când vă prelucrăm datele cu caracter personal, noi, Rent&apos;n Go Prodexa S.R.L., acționăm în calitate de operator în conformitate cu prevederile GDPR.
            </p>
            <p>
              Pentru orice aspect cu privire la prelucrarea datelor cu caracter personal puteți contacta responsabilul nostru cu protecția datelor la următoarele date de contact:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                adresa de e-mail: <Link href="mailto:office@rngo.ro" className="text-primary hover:underline">office@rngo.ro</Link>
              </li>
              <li>telefon: +40773932961</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">2. Când colectăm date despre dvs.?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Colectăm datele dvs. cu caracter personal atunci când, de exemplu:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>sunteți interesat de serviciile noastre de închiriere și ne contactați prin unul din canalele disponibile (e-mail, telefon, website);</li>
              <li>sunteți reprezentant sau persoana de contact a unei entități juridice care dorește sau desfășoară relații comerciale cu noi;</li>
              <li>utilizați serviciile noastre de închiriere autovehicule;</li>
              <li>vizitați sau navigați pe website-ul nostru;</li>
              <li>ne contactați prin diverse canale, sau ne solicitați informații în legătură cu serviciile noastre, inclusiv canalele de comunicare asociate aplicațiilor social media;</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">3. Scopurile prelucrării</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Prelucrăm datele dvs. cu caracter personal în următoarele scopuri:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>în scopul asigurării unei interacțiuni atunci când sunteți interesat de serviciile noastre (activități premergătoare încheierii unui contract de închiriere);</li>
              <li>în scopul asigurării unei interacțiuni și stabilirea unei relații cu dvs. atunci când avem o relație contractuală sau un interes legitim;</li>
              <li>asigurarea unei interacțiuni și stabilirea unei relații cu entitatea pe care o reprezentați, fie că sunteți reprezentant legal, împuternicit sau persoana de contact pentru un actual sau potențial client persoană juridică, cu care intenționăm să încheiem sau am încheiat un contract;</li>
              <li>în vederea îndeplinirii obligațiilor noastre legale;</li>
              <li>în scopul urmăririi intereselor noastre legitime;</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">4. Categoriile de date cu caracter personal prelucrate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Vom putea prelucra următoarele categorii de date:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Detalii personale:</strong> numele și prenumele, datele personale conținute de copia actului de identitate (cod numeric personal, seria și numărul actului, locul nașterii, domiciliul, reședința, data de expirare a actului de identitate) și datele personale conținute de copia permisului de conducere (număr permis, categorie, perioada de valabilitate);</li>
              <li><strong>Informații de contact:</strong> adresa de e-mail, număr de telefon;</li>
              <li><strong>Informații despre rezervare:</strong> data de început și de sfârșit a rezervării, locația de unde se dorește a fi ridicat autovehiculul și ora de preluare și predare;</li>
            </ul>
            <p>
              Societatea noastră nu colectează de la dumneavoastră în mod intenționat categorii speciale de date cu caracter personal pentru a le stoca. Categoriile speciale de date cu caracter personal dezvăluie originea dumneavoastră rasială și etnică, opiniile politice, convingerile religioase și filozofice, afilierea sindicală, datele genetice, datele de biometrie, datele referitoare la sănătate sau datele referitoare la viața sau orientarea sexuală.
            </p>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">5. Temeiul juridic al prelucrării</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Baza legală pentru prelucrarea datelor dumneavoastră cu caracter personal pentru fiecare din scopurile menționate mai sus este:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>necesitatea executării contractului de închiriere la care dumneavoastră sunteți parte sau intenționați să deveniți;</li>
              <li>
                interesele legitime ale societății, de exemplu:
                <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                  <li>prevenirea, detectarea și investigarea infracțiunilor, precum și analizarea și gestionarea riscurilor comerciale, dacă este cazul, în funcție de tipul de contract;</li>
                  <li>constatarea, exercitarea sau apărarea unui drept în instanță;</li>
                  <li>protejarea bunurilor și valorilor societății, îmbunătățirea serviciilor oferite, îndeplinirea obligațiilor noastre față de alte entități, dacă este cazul.</li>
                </ul>
              </li>
            </ul>
            <p>
              Ori de câte ori ne bazăm pe acest temei legal pentru a prelucra datele dvs. cu caracter personal, evaluăm interesele noastre comerciale pentru a ne asigura că acestea nu prevalează asupra drepturilor dvs. În plus, în unele cazuri aveți dreptul de a vă opune acestei prelucrări.
            </p>
            <p>
              De asemenea, ne putem întemeia pe interesul nostru legitim de a ne exercita drepturile prevăzute de lege în favoarea noastră, pentru a acționa în justiție contra oricărei activități ilegale sau care prejudiciază societatea.
            </p>
            <p>Putem folosi datele dvs. cu caracter personal pentru conformarea cu o cerință legală imperativă, de exemplu:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>cerințe contabile și fiscale, raportare;</li>
              <li>îndeplinirea activităților aferente controalelor și solicitărilor de informații ale autorităților, cum ar fi Agenția Națională pentru Administrare Fiscală (ANAF), Autoritatea Națională pentru Protecția Consumatorului (ANPC), Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), Poliția Română, sau altele, în funcție de investigația efectuată.</li>
            </ul>
            <p>În plus, în măsura în care ați fost de acord, consimțământul dumneavoastră reprezintă temeiul legal al prelucrărilor efectuate de noi;</p>
            <p>De asemenea, vă prelucrăm datele cu caracter personal atunci când prelucrarea este necesară pentru îndeplinirea unei sarcini care servește unui interes public;</p>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">6. Categorii de destinatari către care se pot divulga datele dvs. cu caracter personal colectate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>În cazul în care sunteți un client al nostru, datele dvs. cu caracter personal vor fi transmise către:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>furnizorii implicați în mod direct/indirect în prestarea serviciilor din domeniul închirierilor auto;</li>
              <li>autoritățile statului;</li>
              <li>contabili, auditori, experți judiciari, avocați sau alți asemenea consilieri externi ai societății;</li>
            </ul>
            <p>
              Depunem toate eforturile pentru a ne asigura că toate entitățile cu care lucrăm stochează datele dumneavoastră cu caracter personal în condiții de siguranță și securitate.
            </p>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">7. Datele colectate în mod automat</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Când vizitați website-ul, noi colectăm date în mod automat prin browser sau dispozitivul dvs., prin utilizarea cookie-urilor și a tehnologiilor similare. Vă rugăm să consultați Politica de utilizare Cookies pentru informații suplimentare cu privire la aceste practici.
            </p>
          </CardContent>
        </Card>

        {/* Section 9 */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">9. Perioada de păstrare</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Vom păstra datele dvs. personale atât timp cât este necesar, sau permis având în vedere scopul pentru care au fost obținute și în conformitate cu prevederile prezentate în această notă de informare.
            </p>
            <p>Criteriile utilizate pentru a determina duratele perioadelor de păstrare includ:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Durata contractului încheiat între dvs. și societate;</li>
              <li>Perioada de timp necesară furnizării de informații, atunci când ne solicitați acest lucru;</li>
              <li>Existența unor perioade de stocare prevăzute de lege;</li>
              <li>Existența unor interese legitime ale societății;</li>
            </ul>
            <p>Pe această cale, menționăm că, datele dvs. cu caracter personal vor fi stocate astfel:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>În cazul în care anulați rezervarea, ele vor mai fi stocate pentru o perioadă de 2 zile;</li>
              <li>În cazul în care se încheie contractul, ele vor mai fi stocate pentru o perioadă de 360 de zile după data de returnare a autovehiculului închiriat.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 10 */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">10. Transferul către terțe țări și măsuri de siguranță</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Putem să vă transferăm datele cu caracter personal în țări situate în cadrul UE, SEE sau în țări care au fost recunoscute de Comisia Europeană ca asigurând un nivel corespunzător de protecție a datelor dumneavoastră cu caracter personal, dacă se va dovedi necesar în scopurile permise, așa cum au fost descrise mai sus.
            </p>
            <p>
              În situații excepționale, în temeiul scopurilor permise, putem transfera datele cu caracter personal în țări care nu au fost recunoscute de Comisia Europeană ca asigurând un nivel corespunzător de protecție. În acest caz, transferurile se vor face pe baza clauzelor standard de protecție a datelor adoptate de Comisia Europeană (denumite în continuare &quot;Acorduri privind Transferul de Date&quot;) precum și pe baza altor garanții adecvate recunoscute de Regulamentul General privind Protecția Datelor.
            </p>
            <p>Vă asigurăm că veți fi informat în prealabil despre orice operațiune de acest fel.</p>
          </CardContent>
        </Card>

        {/* Section 11 */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">11. Modificări aduse Notei de informare</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Informarea noastră privind prelucrarea datelor cu caracter personal se poate modifica în timp, dar orice modificare a acesteia va fi comunicată prin intermediul unui e-mail sau al unui anunț pe website-ul nostru.
            </p>
          </CardContent>
        </Card>

        {/* Section 12 */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">12. Securitatea datelor cu caracter personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Respectăm proceduri stricte de securitate privind stocarea și dezvăluirea datelor dvs. cu caracter personal și le protejăm împotriva pierderii, distrugerii sau deteriorării accidentale. Putem divulga informațiile dvs. unor terțe părți de încredere pentru scopurile stabilite în această informare.
            </p>
            <p>
              În situația în care securitatea este încălcată din cauza unui atac cibernetic, iar această încălcare este susceptibilă să genereze un risc pentru drepturile dvs, vă asigurăm că o să fiți notificat în termen de maxim 72 de ore, împreună cu autoritățile competente. De asemenea, dacă este posibil, o să vă informăm și despre eventualele măsuri de protecție pe care puteți să le luați. Vă asigurăm că societatea noastră ia toate măsurile pentru a preveni astfel de incidente.
            </p>
          </CardContent>
        </Card>

        {/* Section 13 */}
        <Card className="mb-6 rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle className="text-2xl">13. Drepturile dumneavoastră</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Sunteți îndreptățit să primiți informații de la societate cu privire la prelucrarea datelor dumneavoastră cu caracter personal. În acest sens beneficiați de drepturile detaliate în cele ce urmează:
            </p>
            <ul className="list-disc list-inside space-y-3 ml-4">
              <li><strong>Dreptul de a retrage oricând un consimțământ</strong> dat în vederea opririi unei prelucrări a datelor care se bazează pe consimțământul dvs. Retragerea nu va afecta legalitatea prelucrării pe baza consimțământului acordat înainte de retragere.</li>
              <li><strong>Dreptul de acces</strong> - înseamnă că aveți dreptul de a obține o confirmare din partea noastră că prelucrăm sau nu datele cu caracter personal care vă privesc și, în caz afirmativ, aveți acces la datele respective și la informațiile privind modalitatea în care sunt prelucrate aceste date.</li>
              <li><strong>Dreptul la portabilitatea datelor</strong> - se referă la dreptul de a primi datele cu caracter personal într-un format structurat, utilizat în mod curent de către noi și care poate fi citit automat, dar și la dreptul că aceste date să fie transmise direct altui operator, dacă acest lucru este fezabil din punct de vedere tehnic.</li>
              <li><strong>Dreptul la opoziție</strong> - vizează dreptul dumneavoastră de a vă opune prelucrării datelor dvs. cu caracter personal atunci când prelucrarea este necesară pentru îndeplinirea unei sarcini care servește unui interes public sau când are în vedere un interes legitim al operatorului.</li>
              <li><strong>Dreptul la rectificare</strong> - se referă la corectarea, fără întârzieri nejustificate, a datelor cu caracter personal inexacte. Rectificarea va fi comunicată fiecărui destinatar la care au fost transmise datele, cu excepția cazului în care acest lucru se dovedește imposibil sau presupune eforturi disproporționate.</li>
              <li><strong>Dreptul la ștergerea datelor („dreptul de a fi uitat&quot;)</strong> - înseamnă că aveți dreptul de a solicita ștergerea datelor cu caracter personal, fără întârzieri nejustificate, în cazul în care se aplică unul dintre următoarele motive: acestea nu mai sunt necesare pentru îndeplinirea scopurilor pentru care au fost colectate sau prelucrate; vă retrageți consimțământul și nu există alt temei juridic pentru prelucrare; vă opuneți prelucrării și nu există alte motive legitime care să prevaleze; datele cu caracter personal au fost prelucrate ilegal; datele cu caracter personal trebuie șterse pentru respectarea unei obligații legale; datele cu caracter personal au fost colectate în legătură cu oferirea de servicii ale societății informaționale unui minor sub 16 ani.</li>
              <li><strong>Dreptul la restricționarea prelucrării</strong> - poate fi exercitat în cazul în care persoana contestă exactitatea datelor, pe o perioadă necesară verificării corectitudinii datelor; prelucrarea este ilegală, iar dumneavoastră vă opuneți ștergerii datelor cu caracter personal, solicitând în schimb restricționarea; în cazul în care societatea nu mai are nevoie de datele cu caracter personal în scopul prelucrării, dar persoana le solicită pentru constatarea, exercitarea sau apărarea unui drept în instanță; în cazul în care persoana s-a opus prelucrării pentru intervalul de timp în care se verifică dacă drepturile legitime ale operatorului prevalează asupra celor ale persoanei respective.</li>
              <li><strong>Dreptul de a depune o plângere</strong> – poate fi exercitat în cazul în care considerați că drepturile de care beneficiați în calitate de persoană vizată au fost încălcate. Vă puteți adresa oricând, cu o plângere sau sesizare în acest sens, Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal. De asemenea, puteți introduce o acțiune în justiție, pe rolul instanțelor judecătorești competente.</li>
            </ul>
            <p>
              Pentru exercitarea acestor drepturi, precum și pentru orice întrebări suplimentare cu privire la această informare sau în legătură cu utilizarea de către societate a datelor cu caracter personal, vă rugăm să contactați responsabilul cu protecția datelor, alegând oricare din modalitățile de comunicare descrise în prima parte a prezentului document. Nu va trebui să achitați vreo taxă pentru exercitarea drepturilor mai sus menționate.
            </p>
          </CardContent>
        </Card>

        <div className="section-divider my-10"></div>

        {/* Footer Note */}
        <div className="text-center pb-4">
          <p className="text-sm text-muted-foreground">
            Notă de informare actualizată la data de: 20.04.2025
          </p>
        </div>
      </div>
  );
}

function PrivacyPolicyEn() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header Section */}
      <div className="mb-10">
        <div className="flex justify-center mb-5">
          <div className="accent-line"></div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-5 tracking-tight">
          Privacy Policy
        </h1>
        <h2 className="text-lg text-muted-foreground text-center leading-relaxed max-w-3xl mx-auto">
          INFORMATION REGARDING THE COLLECTION OF PERSONAL DATA FOR NATURAL PERSONS AND LEGAL REPRESENTATIVES / CONTACT PERSONS OF LEGAL ENTITIES
        </h2>
      </div>

      <div className="section-divider mb-10"></div>

      {/* Introduction */}
      <div className="mb-8">
        <p className="text-lg leading-relaxed text-muted-foreground">
          The following information is intended to inform you of the most important aspects regarding the processing of your personal data and your rights related to such processing, in accordance with Regulation (EU) 2016/679 on the General Data Protection Regulation (GDPR) and the applicable national legislation.
        </p>
      </div>

      <div className="section-divider mb-10"></div>

      {/* Section 1 */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">1. General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The protection of your personal data is important to us, which is why we adhere to strict principles in this regard.
          </p>
          <p>
            When we process your personal data, we, Rent&apos;n Go Prodexa S.R.L., act as a data controller in accordance with the provisions of the GDPR.
          </p>
          <p>
            For any matters related to the processing of personal data, you may contact our data protection officer using the following contact details:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              Email address: <Link href="mailto:office@rngo.ro" className="text-primary hover:underline">office@rngo.ro</Link>
            </li>
            <li>Phone: +40 773 932 961</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 2 */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">2. When Do We Collect Your Data?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">We collect your personal data when, for example:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>you are interested in our car rental services and contact us through one of the available channels (email, phone, website);</li>
            <li>you are a representative or contact person of a legal entity that wishes to establish or is engaged in commercial relations with us;</li>
            <li>you use our vehicle rental services;</li>
            <li>you visit or browse our website;</li>
            <li>you contact us through various channels or request information regarding our services, including communication channels associated with social media applications.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 3 */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">3. Purposes of Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">We process your personal data for the following purposes:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>to ensure interaction when you are interested in our services (activities prior to the conclusion of a rental contract);</li>
            <li>to ensure interaction and establish a relationship with you when we have a contractual relationship or a legitimate interest;</li>
            <li>to ensure interaction and establish a relationship with the entity you represent, whether you are a legal representative, an authorized person, or a contact person for an existing or potential corporate client with whom we intend to conclude or have concluded a contract;</li>
            <li>to comply with our legal obligations;</li>
            <li>to pursue our legitimate interests.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 4 */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">4. Categories of Personal Data Processed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>We may process the following categories of personal data:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Personal details:</strong> first and last name; personal data contained in a copy of the identity document (personal identification number, document series and number, place of birth, domicile, residence, and expiration date of the identity document); and personal data contained in a copy of the driving license (license number, category, validity period);</li>
            <li><strong>Contact information:</strong> email address, phone number;</li>
            <li><strong>Reservation information:</strong> start and end date of the reservation, the location from which the vehicle is to be picked up, and the pickup and return times.</li>
          </ul>
          <p>
            Our Company does not intentionally collect special categories of personal data from you for storage. Special categories of personal data include data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, genetic data, biometric data, health-related data, or data concerning a person&apos;s sex life or sexual orientation.
          </p>
        </CardContent>
      </Card>

      {/* Section 5 */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">5. Legal Basis for Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>The legal basis for processing your personal data for each of the purposes mentioned above is as follows:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>the necessity to perform the rental contract to which you are a party or intend to become a party;</li>
            <li>
              the legitimate interests of the Company, for example:
              <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                <li>preventing, detecting, and investigating criminal activities, as well as analyzing and managing commercial risks, where applicable, depending on the type of contract;</li>
                <li>establishing, exercising, or defending a legal claim;</li>
                <li>protecting the Company&apos;s assets and values, improving the services provided, and fulfilling our obligations toward other entities, where applicable.</li>
              </ul>
            </li>
          </ul>
          <p>
            Whenever we rely on this legal basis to process your personal data, we assess our commercial interests to ensure that they do not override your rights. In addition, in certain cases, you have the right to object to such processing.
          </p>
          <p>
            We may also rely on our legitimate interest in exercising the rights granted to us by law, in order to take legal action against any illegal activity or activity that causes harm to the Company.
          </p>
          <p>We may use your personal data to comply with a mandatory legal requirement, for example:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>accounting and tax requirements, reporting obligations;</li>
            <li>carrying out activities related to inspections and requests for information from authorities, such as the National Agency for Fiscal Administration (ANAF), the National Authority for Consumer Protection (ANPC), the National Supervisory Authority for Personal Data Processing (ANSPDCP), the Romanian Police, or other authorities, depending on the investigation conducted.</li>
          </ul>
          <p>In addition, where you have given your consent, your consent constitutes the legal basis for the processing carried out by us.</p>
          <p>We also process your personal data where such processing is necessary for the performance of a task carried out in the public interest.</p>
        </CardContent>
      </Card>

      {/* Section 6 */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">6. Categories of Recipients to Whom Your Personal Data May Be Disclosed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>If you are one of our clients, your personal data may be disclosed to:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>suppliers directly or indirectly involved in the provision of car rental services;</li>
            <li>state authorities;</li>
            <li>accountants, auditors, court experts, lawyers, or other similar external advisors of the Company.</li>
          </ul>
          <p>
            We make every effort to ensure that all entities with whom we collaborate store your personal data in safe and secure conditions.
          </p>
        </CardContent>
      </Card>

      {/* Section 7 */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">7. Data Collected Automatically</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            When you visit the website, we automatically collect data through your browser or device by using cookies and similar technologies. Please refer to the Cookie Policy for additional information regarding these practices.
          </p>
        </CardContent>
      </Card>

      {/* Section 8 */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">8. Retention Period</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We will retain your personal data for as long as necessary or permitted, taking into account the purpose for which it was collected and in accordance with the provisions set out in this information notice.
          </p>
          <p>The criteria used to determine the retention periods include:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>the duration of the contract concluded between you and the Company;</li>
            <li>the period of time required to provide information when you request it;</li>
            <li>the existence of legally stipulated retention periods;</li>
            <li>the existence of legitimate interests of the Company.</li>
          </ul>
          <p>In this regard, please note that your personal data will be stored as follows:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>if you cancel the reservation, the data will be stored for an additional period of 2 days;</li>
            <li>if a contract is concluded, the data will be stored for a period of 360 days after the date of return of the rented vehicle.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section 9 */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">9. Transfers to Third Countries and Safeguards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We may transfer your personal data to countries within the European Union (EU), the European Economic Area (EEA), or to countries that have been recognized by the European Commission as ensuring an adequate level of protection for your personal data, if this proves necessary for the permitted purposes described above.
          </p>
          <p>
            In exceptional situations, based on the permitted purposes, we may transfer personal data to countries that have not been recognized by the European Commission as ensuring an adequate level of protection. In such cases, the transfers will be carried out on the basis of the standard data protection clauses adopted by the European Commission (hereinafter referred to as &quot;Data Transfer Agreements&quot;), as well as on the basis of other appropriate safeguards recognized by the General Data Protection Regulation.
          </p>
          <p>We assure you that you will be informed in advance of any such transfer.</p>
        </CardContent>
      </Card>

      {/* Section 10 */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">10. Amendments to the Information Notice</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Our information notice regarding the processing of personal data may be updated from time to time; however, any changes will be communicated either via email or through an announcement on our website.
          </p>
        </CardContent>
      </Card>

      {/* Section 11 */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">11. Personal Data Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We comply with strict security procedures regarding the storage and disclosure of your personal data and protect it against loss, destruction, or accidental damage. We may disclose your information to trusted third parties for the purposes set out in this information notice.
          </p>
          <p>
            In the event that security is compromised due to a cyberattack and such a breach is likely to result in a risk to your rights, we assure you that you will be notified within a maximum of 72 hours, together with the competent authorities. Where possible, we will also inform you of any protective measures you may take. We assure you that our Company takes all necessary measures to prevent such incidents.
          </p>
        </CardContent>
      </Card>

      {/* Section 12 */}
      <Card className="mb-6 rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="text-2xl">12. Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            You are entitled to receive information from the Company regarding the processing of your personal data. In this regard, you benefit from the rights detailed below:
          </p>
          <ul className="list-disc list-inside space-y-3 ml-4">
            <li><strong>The right to withdraw consent</strong> at any time in order to stop the processing of data based on your consent. Withdrawal of consent will not affect the lawfulness of processing based on consent given before its withdrawal.</li>
            <li><strong>The right of access</strong> — means that you have the right to obtain confirmation from us as to whether or not personal data concerning you is being processed and, where that is the case, access to the respective data and information on how such data is processed.</li>
            <li><strong>The right to data portability</strong> — refers to your right to receive your personal data in a structured, commonly used, and machine-readable format, as well as the right to have such data transmitted directly to another controller, where technically feasible.</li>
            <li><strong>The right to object</strong> — concerns your right to object to the processing of your personal data where such processing is necessary for the performance of a task carried out in the public interest or where it is based on the legitimate interest of the controller.</li>
            <li><strong>The right to rectification</strong> — refers to the correction, without undue delay, of inaccurate personal data. The rectification will be communicated to each recipient to whom the data has been disclosed, unless this proves impossible or involves disproportionate effort.</li>
            <li><strong>The right to erasure (&quot;the right to be forgotten&quot;)</strong> — means that you have the right to request the erasure of your personal data without undue delay where one of the following grounds applies: the data is no longer necessary for the purposes for which it was collected or processed; you withdraw your consent and there is no other legal ground for processing; you object to the processing and there are no overriding legitimate grounds; the personal data has been unlawfully processed; the personal data must be erased to comply with a legal obligation; the personal data was collected in relation to the provision of information society services to a minor under the age of 16.</li>
            <li><strong>The right to restriction of processing</strong> — may be exercised where the accuracy of the data is contested, for a period enabling verification of its accuracy; the processing is unlawful and you oppose the erasure of the personal data, requesting instead the restriction of its use; the Company no longer needs the personal data for processing purposes, but you require it for the establishment, exercise, or defense of legal claims; or where you have objected to processing, for the period during which it is verified whether the legitimate grounds of the controller override those of the data subject.</li>
            <li><strong>The right to lodge a complaint</strong> — may be exercised if you believe that your rights as a data subject have been infringed. You may at any time submit a complaint or notification to the National Supervisory Authority for Personal Data Processing. You also have the right to bring legal proceedings before the competent courts.</li>
          </ul>
          <p>
            To exercise these rights, as well as for any additional questions regarding this information notice or the Company&apos;s use of personal data, please contact the data protection officer using any of the communication methods described in the first part of this document. You will not be required to pay any fee for exercising the rights listed above.
          </p>
        </CardContent>
      </Card>

      <div className="section-divider my-10"></div>

      {/* Footer Note */}
      <div className="text-center pb-4">
        <p className="text-sm text-muted-foreground">
          Information notice last updated: 20.04.2025
        </p>
      </div>
    </div>
  );
}
