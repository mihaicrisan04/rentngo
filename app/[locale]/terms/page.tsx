import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layout/page-layout";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// export default function TermsAndConditionsPage() {
//   return (
//     <div>
//       <h1>Terms and Conditions</h1>
//     </div>
//   );
// }

export default function TermsAndConditionsPage() {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            Termeni și Condiții
          </h1>
          <h2 className="text-xl text-muted-foreground text-center leading-relaxed">
            Contractul de Servicii de Închiriere Auto
          </h2>
        </div>

        <Separator className="mb-8" />

        {/* Introduction */}
        <div className="mb-8">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Bun venit la Rent'n Go. Acești termeni și condiții prezintă regulile și reglementările pentru utilizarea serviciilor noastre de închiriere auto. Prin închirierea unui vehicul de la noi, acceptați acești termeni și condiții în totalitate.
          </p>
        </div>

        <Separator className="mb-8" />

        {/* Section 1 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">1. Acceptarea Termenilor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Prin accesarea și utilizarea serviciilor noastre de închiriere auto, acceptați și sunteți de acord să fiți obligat de termenii și prevederile acestui acord.
            </p>
            <p>
              Dacă nu sunteți de acord să respectați cele de mai sus, vă rugăm să nu utilizați serviciile noastre.
            </p>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">2. Cerințe pentru Închiriere</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Pentru a închiria un vehicul de la Rent'n Go, trebuie să îndepliniți următoarele cerințe:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Să aveți cel puțin 21 de ani (25+ pentru vehicule premium)</li>
              <li>Să dețineți un permis de conducere valabil de cel puțin 1 an</li>
              <li>Să prezentați un act de identitate valabil emis de stat</li>
              <li>Să prezentați un card de credit major pe numele dvs.</li>
              <li>Să îndepliniți cerințele noastre de asigurare și credit</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">3. Utilizarea Vehiculului și Restricții</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Vehiculul închiriat trebuie să fie utilizat în conformitate cu următoarele condiții:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Doar șoferii autorizați pot opera vehiculul</li>
              <li>Vehiculul nu trebuie să fie folosit în scopuri comerciale</li>
              <li>Fumatul este interzis în toate vehiculele</li>
              <li>Animalele de companie sunt permise doar cu aprobare prealabilă</li>
              <li>Vehiculul nu trebuie să depășească capacitatea de pasageri</li>
              <li>Conducerea în teren este strict interzisă</li>
              <li>Cursele, raliul sau orice tip de conducere competițională sunt interzise</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">4. Termeni de Plată</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Plata pentru serviciile de închiriere este supusă următorilor termeni:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Plata integrală este necesară în momentul rezervării sau preluării</li>
              <li>O garanție va fi pre-autorizată pe cardul dvs. de credit</li>
              <li>Pot fi aplicate taxe suplimentare pentru servicii extra, daune sau încălcări</li>
              <li>Taxele de combustibil se aplică dacă vehiculul nu este returnat cu același nivel de combustibil</li>
              <li>Taxele pentru returnarea târzie vor fi percepute pentru vehiculele returnate după timpul convenit</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">5. Politica de Anulare și Modificare</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Anulare gratuită:</strong> Cu până la 24 de ore înainte de timpul de preluare</li>
              <li><strong>Anulare tardivă:</strong> În termen de 24 de ore implică o taxă de 50%</li>
              <li><strong>Neprezentare:</strong> Se va percepe suma totală de închiriere</li>
              <li><strong>Modificări:</strong> În funcție de disponibilitate și pot implica taxe suplimentare</li>
              <li><strong>Returnare anticipată:</strong> Fără rambursare pentru perioada de închiriere nefolosită</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">6. Asigurare și Răspundere</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Termenii de acoperire asigurare și răspundere:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Acoperirea de asigurare de bază este inclusă în toate închirierile</li>
              <li>Renunțarea opțională la daune comprehensive (CDW) este disponibilă</li>
              <li>Chiriașul este responsabil pentru daunele care nu sunt acoperite de asigurare</li>
              <li>Asigurarea de răspundere civilă față de terți este obligatorie</li>
              <li>Bunurile personale nu sunt acoperite de asigurarea noastră</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">7. Condițiile de Returnare a Vehiculului</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Vehiculele trebuie să fie returnate în următoarea stare:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>La timpul și locația convenite</li>
              <li>Cu același nivel de combustibil ca la preluare</li>
              <li>În stare curată (interior și exterior)</li>
              <li>Cu toate accesoriile și documentația furnizate</li>
              <li>Fără daune noi sau probleme mecanice</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 8 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">8. Utilizări Interzise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Următoarele activități sunt strict interzise:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Transportarea substanțelor ilegale sau de contrabandă</li>
              <li>Utilizarea vehiculului sub influența alcoolului sau drogurilor</li>
              <li>Subînchirierea sau transferarea închirierii către părți neautorizate</li>
              <li>Împingerea sau remorcherea altor vehicule sau remorci</li>
              <li>Învățarea cuiva să conducă</li>
              <li>Utilizarea vehiculului în afara României fără aprobare prealabilă</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 9 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">9. Defecțiuni și Urgențe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>În caz de defecțiune a vehiculului sau urgență:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Contactați imediat linia noastră de urgență 24/7</li>
              <li>Nu încercați reparații fără autorizarea noastră</li>
              <li>Oferim asistență rutieră și vehicule de înlocuire când este posibil</li>
              <li>Contact de urgență: <Link href="tel:+40773932961" className="text-primary hover:underline">+40773932961</Link></li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 10 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">10. Rezolvarea Disputelor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Orice dispute care rezultă din acest acord vor fi rezolvate prin legea română. 
              Încurajăm clienții să ne contacteze mai întâi pentru a rezolva orice probleme pe cale amiabilă.
            </p>
            <p>
              Pentru reclamații sau îngrijorări, vă rugăm să ne contactați la: <Link href="mailto:office@rngo.ro" className="text-primary hover:underline">office@rngo.ro</Link>
            </p>
          </CardContent>
        </Card>

        {/* Section 11 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">11. Modificări ale Termenilor</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Rent'n Go își rezervă dreptul de a modifica acești termeni și condiții în orice moment. 
              Termenii actualizați vor fi postați pe website-ul nostru și se vor aplica tuturor rezervărilor noi.
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
            <p><strong>Rent'n Go Prodexa S.R.L.</strong></p>
            <p>Email: <Link href="mailto:office@rngo.ro" className="text-primary hover:underline">office@rngo.ro</Link></p>
            <p>Telefon: +40773932961</p>
            <p>Adresă: Calea Turzii 23, Cluj-Napoca, România</p>
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

