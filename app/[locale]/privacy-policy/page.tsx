import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <Header logo={<Image src="/logo.png" alt="Rent'n Go Logo" width={150} height={50} />} />

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center">Politica de Confidențialitate</CardTitle>
              <p className="text-center text-muted-foreground">Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">1. Informații Generale</h2>
                  <p className="text-justify">
                    Această Politică de Confidențialitate descrie cum <strong>RENT'N GO PRODEXA S.R.L.</strong> (denumită în continuare "Societatea", "noi" sau "compania"), cu sediul în Sat Florești, strada Tăuțului, Nr.214D, Jud. Cluj, înregistrată la Registrul Comerțului sub nr. J12/1445/2024, având C.U.I. 49799254, colectează, utilizează, stochează și protejează informațiile dumneavoastră personale când utilizați serviciile noastre de închiriere auto prin platforma www.rngo.ro.
                  </p>
                  <p className="text-justify">
                    Prin utilizarea serviciilor noastre, acceptați practicile descrise în această politică de confidențialitate.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">2. Informațiile Pe Care Le Colectăm</h2>
                  <p className="text-justify mb-4">
                    Pentru a vă putea oferi serviciile de închiriere auto, colectăm următoarele categorii de informații personale:
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">2.1. Informații de Identificare</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Nume și prenume complet</li>
                        <li>Adresa de email</li>
                        <li>Numărul de telefon</li>
                        <li>Adresa de domiciliu/reședință</li>
                        <li>Data nașterii (pentru verificarea vârstei minime de 23 ani)</li>
                        <li>Numărul cărții de identitate sau pașaportului</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">2.2. Informații de Conducere</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Numărul și validitatea permisului de conducere</li>
                        <li>Experiența de conducere (minimum 2 ani)</li>
                        <li>Permis de conducere internațional (dacă este cazul)</li>
                        <li>Istoricul de infracțiuni rutiere (dacă este necesar)</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">2.3. Informații Financiare</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Detaliile cardului de credit/debit pentru garanție (200-1800 EUR)</li>
                        <li>Informații de facturare</li>
                        <li>Istoricul plăților și tranzacțiilor</li>
                        <li>Informații despre avansurile plătite</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">2.4. Informații despre Rezervare și Închiriere</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Detaliile rezervării (date, locații, tipul vehiculului)</li>
                        <li>Numărul de zbor (opțional)</li>
                        <li>Preferințe speciale și cereri suplimentare</li>
                        <li>Istoricul închirierilor anterioare</li>
                        <li>Kilometrajul și starea vehiculului la preluare/returnare</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">2.5. Informații Tehnice</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Adresa IP și locația geografică</li>
                        <li>Informații despre browser și dispozitiv</li>
                        <li>Activitatea pe website (pagini vizitate, timpul petrecut)</li>
                        <li>Cookie-uri și tehnologii similare de urmărire</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">3. Cum Utilizăm Informațiile Dumneavoastră</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.1. Prestarea Serviciilor</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Procesarea și confirmarea rezervărilor</li>
                        <li>Verificarea eligibilității pentru închiriere (vârstă, permis de conducere)</li>
                        <li>Gestionarea garanțiilor și plăților</li>
                        <li>Furnizarea vehiculelor și documentației necesare</li>
                        <li>Monitorizarea respectării termenilor contractuali</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.2. Comunicare și Suport</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Confirmarea rezervărilor prin email, telefon sau WhatsApp</li>
                        <li>Notificări despre modificări sau actualizări</li>
                        <li>Furnizarea asistenței rutiere pe teritoriul României</li>
                        <li>Rezolvarea reclamațiilor și problemelor</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.3. Securitate și Prevenirea Fraudei</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Verificarea identității și prevenirii tentativelor de fraudă</li>
                        <li>Monitorizarea activităților suspecte</li>
                        <li>Protejarea împotriva utilizării neautorizate a vehiculelor</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-2">3.4. Îmbunătățirea Serviciilor</h3>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Analizarea preferințelor și feedback-ului clienților</li>
                        <li>Dezvoltarea și îmbunătățirea platformei online</li>
                        <li>Optimizarea proceselor de rezervare și închiriere</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">4. Partajarea Informațiilor</h2>
                  <p className="text-justify mb-4">
                    Nu vindem și nu închiriem informațiile dumneavoastră personale către terțe părți. Putem partaja informațiile doar în următoarele circumstanțe:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Furnizori de servicii:</strong> Companii care ne ajută să operăm (procesare plăți, asistență rutieră, service-uri auto agreate)</li>
                    <li><strong>Autoritățile competente:</strong> Când este cerut de lege sau pentru protejarea drepturilor noastre (Poliție, instanțe de judecată din Cluj-Napoca)</li>
                    <li><strong>Companii de asigurări:</strong> Pentru procesarea daunelor și asigurărilor SCDW</li>
                    <li><strong>Transfer de afaceri:</strong> În cazul unei fuziuni, achiziții sau transferul de active</li>
                    <li><strong>Extinderea teritorială:</strong> Autorități din țările UE pentru permisele de conducere în străinătate</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">5. Securitatea Datelor</h2>
                  <p className="text-justify mb-4">
                    Implementăm măsuri de securitate corespunzătoare pentru a proteja informațiile dumneavoastră personale împotriva accesului neautorizat, modificării, divulgării sau distrugerii:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Criptarea datelor sensibile (informații card bancar, documente personale)</li>
                    <li>Acces restricționat la informațiile personale doar pentru personalul autorizat</li>
                    <li>Monitorizarea activității sistemului pentru detectarea încercărilor de fraudă</li>
                    <li>Backup-uri regulate și sisteme de recuperare a datelor</li>
                    <li>Actualizarea regulată a sistemelor de securitate</li>
                  </ul>
                  <p className="text-justify mt-4">
                    Cu toate acestea, nicio metodă de transmisie prin internet sau stocare electronică nu este 100% sigură, iar noi nu putem garanta securitatea absolută.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">6. Drepturile Dumneavoastră (GDPR)</h2>
                  <p className="text-justify mb-4">
                    Conform Regulamentului General privind Protecția Datelor (GDPR), aveți următoarele drepturi:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">Dreptul de acces:</h3>
                      <p>Să solicitați o copie a informațiilor personale pe care le deținem despre dumneavoastră</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Dreptul de rectificare:</h3>
                      <p>Să corectați informațiile inexacte sau incomplete</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Dreptul la ștergere:</h3>
                      <p>Să solicitați ștergerea datelor personale în anumite circumstanțe</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Dreptul la restricționarea prelucrării:</h3>
                      <p>Să solicitați limitarea modului în care folosim datele dumneavoastră</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Dreptul la portabilitatea datelor:</h3>
                      <p>Să primiți datele într-un format structurat și să le transferați altui operator</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Dreptul de opoziție:</h3>
                      <p>Să vă opuneți prelucrării datelor în anumite circumstanțe</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">7. Păstrarea Datelor</h2>
                  <p className="text-justify mb-4">
                    Păstrăm informațiile dumneavoastră personale doar atâta timp cât este necesar pentru îndeplinirea scopurilor pentru care au fost colectate:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Durante închirierii:</strong> Toate datele sunt păstrate pentru gestionarea contractului</li>
                    <li><strong>După închiriere:</strong> 7 ani pentru obligațiile fiscale și contabile</li>
                    <li><strong>Dosare medicale/accidente:</strong> Conform legislației în vigoare</li>
                    <li><strong>Date de marketing:</strong> Până la retragerea consimțământului</li>
                    <li><strong>Cookie-uri:</strong> Conform setărilor browserului (maxim 2 ani)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">8. Cookie-uri și Tehnologii de Urmărire</h2>
                  <p className="text-justify mb-4">
                    Utilizăm cookie-uri și tehnologii similare pentru a îmbunătăți experiența dumneavoastră pe website-ul nostru:
                  </p>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold">Cookie-uri esențiale:</h3>
                      <p>Necesare pentru funcționarea de bază a site-ului (sesiuni, securitate)</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Cookie-uri de performanță:</h3>
                      <p>Ne ajută să înțelegem cum utilizați site-ul pentru îmbunătățiri</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Cookie-uri de marketing:</h3>
                      <p>Pentru afișarea de reclame relevante (doar cu consimțământul dumneavoastră)</p>
                    </div>
                  </div>
                  <p className="text-justify mt-4">
                    Puteți controla setările cookie-urilor prin preferințele browserului dumneavoastră.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">9. Transferuri Internaționale</h2>
                  <p className="text-justify mb-4">
                    Atunci când închiriați vehicule pentru călătorii în afara României (doar în țările UE conform punctului 3.13 din Termenii și Condițiile), datele dumneavoastră pot fi transferate către:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Companii de asigurări din țara de destinație</li>
                    <li>Autorități locale pentru emiterea împuterniciților de conducere</li>
                    <li>Servicii de asistență rutieră internaționale</li>
                  </ul>
                  <p className="text-justify mt-4">
                    Toate transferurile se fac cu măsuri de protecție adecvate conform GDPR.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4 text-primary">10. Modificări ale Politicii</h2>
                  <p className="text-justify">
                    Ne rezervăm dreptul de a actualiza această politică de confidențialitate din timp în timp. Orice modificări vor fi publicate pe această pagină cu data actualizării. Modificările intră în vigoare imediat după publicare. Vă încurajăm să verificați periodic această politică pentru a fi informați despre cum protejăm informațiile dumneavoastră.
                  </p>
                </section>

                <section className="border-t pt-6">
                  <h2 className="text-2xl font-bold mb-4 text-primary">11. Contact și Plângeri</h2>
                  <p className="text-justify mb-4">
                    Pentru întrebări despre această politică de confidențialitate, exercitarea drepturilor dumneavoastră sau pentru a depune o plângere, ne puteți contacta:
                  </p>
                  <div className="space-y-2 mb-4">
                    <p><strong>RENT'N GO PRODEXA S.R.L.</strong></p>
                    <p>Sediu: Sat Florești, strada Tăuțului, Nr.214D, Jud. Cluj</p>
                    <p>Email: privacy@rngo.ro</p>
                    <p>Email general: info@rngo.ro</p>
                    <p>Website: www.rngo.ro</p>
                    <p>J12/1445/2024, C.U.I. 49799254</p>
                  </div>
                  <p className="text-justify">
                    De asemenea, aveți dreptul să depuneți o plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP) dacă considerați că prelucrarea datelor dumneavoastră încalcă legislația în vigoare.
                  </p>
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