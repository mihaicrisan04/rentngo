import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsAndConditionsPage() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">Termeni și Condiții</CardTitle>
              <p className="text-center text-muted-foreground">Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-8">
                {/* Section I */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">I. DISPOZIȚII GENERALE</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">1.1.</h3>
                      <p className="text-justify">
                        Termenii și Condițiile (denumite în continuare T&C) reglementează funcționarea platformei de închirieri <strong>www.rngo.ro</strong> (denumită în continuare Site-ul), deținută de societatea <strong>RENT'N GO PRODEXA S.R.L.</strong>, persoană juridică română cu sediul în Sat Florești, strada Tăuțului, Nr.214D, Jud. Cluj, înregistrată la Registrul Comerțului de pe lângă Tribunalul Cluj sub nr. J12/1445/2024, având C.U.I. 49799254 (denumită în continuare Societatea). T&C sunt concepute pentru a oferi informații relevante despre serviciile de închiriere.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">1.2.</h3>
                      <p className="text-justify">
                        Prin utilizarea și/sau rezervarea unui autovehicul de pe acest Site și nu numai, vă supuneți în totalitate acestor Termeni și Condiții, precum și legislației din România.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">1.3.</h3>
                      <p className="text-justify">
                        Navigând pe acest site și/sau efectuând rezervarea unui autovehicul pe www.rngo.ro, declarați că ați înțeles și acceptat prezentele Termeni și Condiții, precum și Politica de Confidențialitate.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">1.4.</h3>
                      <p className="text-justify">
                        T&C sunt valabile pe o perioadă nedeterminată. Utilizatorii înțeleg că Societatea are dreptul de a le modifica unilateral fără notificare prealabilă către aceștia. Orice modificări vor intra în vigoare imediat după publicarea lor pe Site. Utilizatorii sunt îndemnați să monitorizeze eventualele modificări.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section II */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">II. DESCRIEREA SERVICIILOR</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">2.1.</h3>
                      <p className="text-justify">
                        RENT' N GO PRODEXA este o companie de închirieri auto care vă pune la dispoziție autoturisme în stare optimă de funcționare, curate atât în interior, cât și în exterior. Prin semnarea contractului de închiriere, vă exprimați acordul cu termenii și condițiile, precum și cu politica de confidențialitate a companiei.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">2.2.</h3>
                      <p className="text-justify">
                        Toate modelele de autoturisme prezentate pe site reflectă gama existentă în flota noastră, dar afișarea acestora nu garantează disponibilitatea în timpul solicitării dvs. După plasarea unei cereri de rezervare, disponibilitatea modelului ales va fi confirmată prin e-mail, telefon sau WhatsApp de către unul dintre reprezentanții noștri.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">2.3.</h3>
                      <p className="text-justify">
                        Vă reamintim că transmiterea unei cereri de rezervare nu constituie o rezervare fermă a autoturismului respectiv.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section III */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">III. CONDIȚII GENERALE DE ÎNCHIRIERE</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.1.</h3>
                      <p className="text-justify">
                        Taxa pentru închirierea mașinilor în Cluj, asigurarea completă SCDW sau garanția de închiriere se plătesc în avans, fie la confirmarea rezervării, fie la preluarea autoturismului de către dumneavoastră. Perioada minimă de închiriere este de o (1) zi, cu excepția perioadelor de sărbători precum Paștele, Crăciunul, Revelionul și perioada de vară (din luna Iunie până în Septembrie) când perioada minimă de închiriere este de 10 (zece) zile.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.2.</h3>
                      <p className="text-justify">
                        <strong>Vârsta minimă pentru închiriere este de 23 de ani</strong>, iar conducătorii auto trebuie să dețină permisul de conducere de cel puțin doi ani. În caz contrar, ne rezervăm dreptul de a anula comanda dumneavoastră, fără a implica alte consecințe asupra firmei.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.3.</h3>
                      <p className="text-justify">
                        Orice modificare a datelor din contract trebuie comunicată expres de către client, însă nu mai târziu de 24 de ore de la momentul preluării mașinii.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.4.</h3>
                      <p className="text-justify">
                        În perioadele foarte aglomerate, ne rezervăm dreptul de a solicita un avans de 10% din valoarea totală a închirierii. Acest avans este nereturnabil în cazul în care clientul anulează rezervarea sau nu se prezintă pentru preluarea autoturismului la ora și locația stabilite în confirmarea rezervării. De asemenea, în cazul în care a fost aleasă plata integrală la confirmarea rezervării, în cazul anulării rezervării, se va reține doar 10% din suma totală a perioadei de închiriere.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.5.</h3>
                      <p className="text-justify">
                        Facturarea în RON se face la cursul de vânzare al BNR +1% din ziua semnării Contractului.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.6.</h3>
                      <p className="text-justify">
                        În cazul întârzierii plății, peste termenul stipulat în Contract, Societatea are dreptul de a percepe penalități în valoare de 3%, din valoarea sumei datorate, pentru fiecare zi de întârziere.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.7.</h3>
                      <p className="text-justify">
                        În perioadele extrem de aglomerate, din cauza volumului mare de cereri și a situațiilor neprevăzute precum accidentele sau defectele tehnice, ne rezervăm dreptul de a vă oferi un model similar celui ales inițial. Refuzul dumneavoastră de a accepta modelul oferit nu atrage obligația noastră de a vă returna avansul plătit.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.8.</h3>
                      <p className="text-justify">
                        Clientul este responsabil să returneze autoturismul în aceeași stare în care a fost preluat, inclusiv toate documentele și accesoriile furnizate în momentul închirierii. Autoturismul trebuie să fie returnat cu rezervorul plin și să fie curățat atât în interior, cât și în exterior. În cazul în care nu puteți returna autoturismul curat, va fi aplicată o taxă de spălare în valoare de 10 euro, iar pentru autoturismele premium și Mini-vanuri, taxa va fi de 18 euro.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.9.</h3>
                      <p className="text-justify">
                        Orice întârziere care depășește ora stabilită în contract va fi taxată cu o zi întreagă de închiriere pentru primele 2 ore. Orice depășire a orei specificate în contract cu peste 2 ore va fi raportată poliției și va fi taxată cu sume între 100 și 300 euro, în funcție de valoarea autoturismului. O excepție pentru paragraful de mai sus poate fi făcută doar în situația în care este menționată în mod explicit în contract și este semnată de ambele părți.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.10.</h3>
                      <p className="text-justify">
                        Tariful de închiriere acoperă o medie de 200 km/zi. Kilometrii suplimentari vor fi taxați cu 5 EUR/50km pentru clasele standard și business și cu 8 EURO/50km pentru clasa premium. În cazul în care autoturismul este returnat cu o cantitate mai mică de combustibil față de momentul închirierii, se va aplica o taxă de 2.5 EUR/litru.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.12.</h3>
                      <p className="text-justify">
                        Pierderea sau distrugerea cheilor autoturismului va fi taxată între 200 și 700 EUR, iar pierderea sau distrugerea documentelor autoturismului va fi taxată cu 100 EUR.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.13.</h3>
                      <p className="text-justify">
                        În anumite condiții, este posibilă conducerea autoturismelor în afara granițelor României, însă doar în țările membre ale UE. Acest aspect trebuie notificat la confirmarea rezervării și implică o taxă de 50 EUR/ieșire, necesară extinderii teritoriale a asigurărilor și emiterii împuterniciților de conducere pentru șoferi.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.14.</h3>
                      <p className="text-justify">
                        <strong>Taxe suplimentare:</strong> Orice amendă, pene de cauciuc, taxă de drum sau de parcare etc., precum și contravaloarea eventualelor reparații pe perioada închirierii, rezultate din acțiunile chiriașului, vor fi suportate de către acesta. În plus, în cazul în care, din vina chiriașului, mașina nu mai poate fi condusă pe propriile roți în urma unui accident, prin semnarea acestui contract, clientul se obligă să acopere cheltuielile cu transportul acesteia pe o platformă până la sediul de unde a închiriat-o.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section IV */}
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">IV. GARANȚIA ȘI ASIGURAREA SCDW</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">4.1.</h3>
                      <p className="text-justify">
                        În momentul preluării autoturismului, clientul este de acord cu blocarea unei garanții cuprinse între 200 și 1800 EUR (în funcție de valoarea mașinii închiriate), fie prin intermediul unui card bancar, fie în numerar. Această sumă va fi restituită integral în cazul în care clientul returnează autoturismul în stare nevătămată, curat și cu toate accesoriile, la locul, data și ora convenite în contract, sau prin achitarea asigurării SCDW (Super Collision Damage Waiver), calculată în funcție de numărul de zile și clasa autoturismului închiriat.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">4.2.</h3>
                      <p className="text-justify">
                        În cazul garanției de închiriere, aceasta va fi percepută la începutul perioadei de închiriere sau blocată pe cardul bancar și ulterior deblocată la restituirea autoturismului în aceleași condiții ca la preluare. În situația în care autoturismul este returnat foarte murdar, ne rezervăm dreptul de a bloca această garanție până la curățarea autoturismului și stabilirea exactă a stării de returnare. În cazul în care autoturismul este returnat cu daune sau lipsă de accesorii, garanția de închiriere va fi reținută parțial sau integral. Garanția acoperă parțial situația daunelor totale. În această situație, clientul se obligă să achite între 1000 și 8000 EUR în funcție de modelul închiriat.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">4.3.</h3>
                      <p className="text-justify">
                        Asigurarea SCDW este o asigurare complementară pentru protecția împotriva daunelor și evenimentelor posibile produse din vina clientului sau a unei terțe persoane. Aceasta exonerează clientul de răspunderea financiară în cazul daunelor și reduce la zero valoarea garanției. Asigurarea SCDW acoperă parțial situația daunelor totale. În această situație, clientul se obligă să achite între 1000 și 8000 EUR în funcție de modelul închiriat.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">4.4.</h3>
                      <p className="text-justify">
                        Asigurarea SCDW nu acoperă combustibilul consumat, daunele aduse anvelopelor și părții inferioare a autovehiculului (sasiu, bloc motor, baie de ulei, cutie de viteze) datorate unei acțiuni deliberare sau neglijente, precum și în cazul pierderii accesoriilor autoturismului. Atât asigurarea SCDW, cât și garanția de închiriere acoperă doar persoanele înscrise în contract cu dreptul de a conduce autoturismul închiriat.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="border-t pt-6">
                  <h2 className="text-2xl font-bold mb-4 text-primary">Informații de Contact</h2>
                  <div className="space-y-2">
                    <p><strong>RENT'N GO PRODEXA S.R.L.</strong></p>
                    <p>Sediu: Sat Florești, strada Tăuțului, Nr.214D, Jud. Cluj</p>
                    <p>J12/1445/2024, C.U.I. 49799254</p>
                    <p>Email: info@rngo.ro</p>
                    <p>Website: www.rngo.ro</p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer
        logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />}
        brandName=""
      />
    </div>
  );
} 