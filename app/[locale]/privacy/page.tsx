import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            Politică de confidențialitate
          </h1>
          <h2 className="text-xl text-muted-foreground text-center leading-relaxed">
            INFORMARE PRIVIND COLECTAREA DATELOR CU CARACTER PERSONAL PENTRU PERSOANE FIZICE ȘI REPREZENTANȚI LEGALI/PERSOANA DE CONTACT A PERSOANELOR JURIDICE
          </h2>
        </div>

        <Separator className="mb-8" />

        {/* Introduction */}
        <div className="mb-8">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Următoarea informare este concepută pentru a vă aduce la cunoștință cele mai importante aspecte cu privire la prelucrarea datelor dvs. cu caracter personal și la drepturile dvs. privind aceasta prelucrare în conformitate cu Regulamentul general privind protecția datelor 2016/679 (GDPR) și legislația națională aplicabilă.
          </p>
        </div>

        <Separator className="mb-8" />

        {/* Section 1 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">1. Informații generale</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Protecția datelor dvs. cu caracter personal este importantă pentru noi, motiv pentru care am aderat la principii stricte în această privință.
            </p>
            <p>
              Atunci când vă prelucrăm datele cu caracter personal, noi, Rent'n Go Prodexa S.R.L., acționăm în calitate de operator în conformitate cu prevederile GDPR.
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">10. Transferul către terțe țări și măsuri de siguranță</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Putem să vă transferăm datele cu caracter personal în țări situate în cadrul UE, SEE sau în țări care au fost recunoscute de Comisia Europeană ca asigurând un nivel corespunzător de protecție a datelor dumneavoastră cu caracter personal, dacă se va dovedi necesar în scopurile permise, așa cum au fost descrise mai sus.
            </p>
            <p>
              În situații excepționale, în temeiul scopurilor permise, putem transfera datele cu caracter personal în țări care nu au fost recunoscute de Comisia Europeană ca asigurând un nivel corespunzător de protecție. În acest caz, transferurile se vor face pe baza clauzelor standard de protecție a datelor adoptate de Comisia Europeană (denumite în continuare "Acorduri privind Transferul de Date") precum și pe baza altor garanții adecvate recunoscute de Regulamentul General privind Protecția Datelor.
            </p>
            <p>Vă asigurăm că veți fi informat în prealabil despre orice operațiune de acest fel.</p>
          </CardContent>
        </Card>

        {/* Section 11 */}
        <Card className="mb-6">
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
        <Card className="mb-6">
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
        <Card className="mb-6">
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
              <li><strong>Dreptul la ștergerea datelor („dreptul de a fi uitat")</strong> - înseamnă că aveți dreptul de a solicita ștergerea datelor cu caracter personal, fără întârzieri nejustificate, în cazul în care se aplică unul dintre următoarele motive: acestea nu mai sunt necesare pentru îndeplinirea scopurilor pentru care au fost colectate sau prelucrate; vă retrageți consimțământul și nu există alt temei juridic pentru prelucrare; vă opuneți prelucrării și nu există alte motive legitime care să prevaleze; datele cu caracter personal au fost prelucrate ilegal; datele cu caracter personal trebuie șterse pentru respectarea unei obligații legale; datele cu caracter personal au fost colectate în legătură cu oferirea de servicii ale societății informaționale unui minor sub 16 ani.</li>
              <li><strong>Dreptul la restricționarea prelucrării</strong> - poate fi exercitat în cazul în care persoana contestă exactitatea datelor, pe o perioadă necesară verificării corectitudinii datelor; prelucrarea este ilegală, iar dumneavoastră vă opuneți ștergerii datelor cu caracter personal, solicitând în schimb restricționarea; în cazul în care societatea nu mai are nevoie de datele cu caracter personal în scopul prelucrării, dar persoana le solicită pentru constatarea, exercitarea sau apărarea unui drept în instanță; în cazul în care persoana s-a opus prelucrării pentru intervalul de timp în care se verifică dacă drepturile legitime ale operatorului prevalează asupra celor ale persoanei respective.</li>
              <li><strong>Dreptul de a depune o plângere</strong> – poate fi exercitat în cazul în care considerați că drepturile de care beneficiați în calitate de persoană vizată au fost încălcate. Vă puteți adresa oricând, cu o plângere sau sesizare în acest sens, Autorității Naționale de Supraveghere a Prelucrării Datelor cu Caracter Personal. De asemenea, puteți introduce o acțiune în justiție, pe rolul instanțelor judecătorești competente.</li>
            </ul>
            <p>
              Pentru exercitarea acestor drepturi, precum și pentru orice întrebări suplimentare cu privire la această informare sau în legătură cu utilizarea de către societate a datelor cu caracter personal, vă rugăm să contactați responsabilul cu protecția datelor, alegând oricare din modalitățile de comunicare descrise în prima parte a prezentului document. Nu va trebui să achitați vreo taxă pentru exercitarea drepturilor mai sus menționate.
            </p>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Notă de informare actualizată la data de: 20.04.2025
          </p>
        </div>
      </div>
  );
}
