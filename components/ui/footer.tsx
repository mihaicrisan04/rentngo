import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { SocialIcon } from 'react-social-icons'


interface FooterProps {
  logo: React.ReactNode
  brandName?: string
}

const socialLinks = [
  {
    icon: <SocialIcon url="https://www.tiktok.com/@rentn.go" style={{ height: 36, width: 36 }} borderRadius={"0.5rem"}/>,
    href: "https://www.tiktok.com/@rentngo",
    label: "TikTok",
  },
  {
    icon: <SocialIcon url="https://www.instagram.com/rentn_go.ro" style={{ height: 36, width: 36 }} borderRadius={"0.5rem"}/>,
    href: "https://www.instagram.com/rentn_go.ro",
    label: "Instagram",
  },
  {
    icon: <SocialIcon url="https://www.facebook.com/share/1Ad82uMtP3/?mibextid=wwXIfr" style={{ height: 36, width: 36 }} borderRadius={"0.5rem"}/>,
    href: "https://www.facebook.com/share/1Ad82uMtP3/?mibextid=wwXIfr",
    label: "Facebook",
  },
]

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/cars", label: "Cars" },
  { href: "/transfers", label: "Transfers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms-and-conditions", label: "Terms" },
]

const copyright = {
  text: "© 2025 Rent'n Go Cluj",
  license: "All rights reserved",
}

export function Footer({ logo, brandName }: FooterProps) {
  return (
    <footer className="pb-6 pt-16 lg:pb-8 px-4 lg:pt-24 bg-muted border-t">
      <div className="container mx-auto lg:px-8">
        <div className="md:flex md:items-end md:justify-between">
          <Link href="/" className="flex items-center gap-x-2" aria-label={brandName || "Go to homepage"}>
            {logo}
            {brandName && <span className="font-bold text-xl">{brandName}</span>}
          </Link>
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <ul className="flex list-none space-x-3">
              {socialLinks.map((link, i) => (
                <li key={i} className="h-9 w-9 rounded-full">
                  {link.icon}
                </li>
              ))}
            </ul>
            <ThemeToggle />
          </div>
        </div>
        <div className="border-t mt-6 pt-6 md:mt-8 md:pt-8 lg:grid lg:grid-cols-10 lg:gap-8">
          <nav className="lg:col-start-5 lg:col-span-6 xl:col-start-6 xl:col-span-5 mb-6 lg:mb-0">
            <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="my-1 mx-2 shrink-0">
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 hover:text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="lg:col-start-5 lg:col-span-6 xl:col-start-6 xl:col-span-5 mb-6 lg:mb-0">
            <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="my-1 mx-3 shrink-0">
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 text-sm leading-6 text-muted-foreground whitespace-nowrap lg:mt-0 lg:row-start-1 lg:col-span-4 xl:col-span-5">
            <div>{copyright.text}</div>
            {copyright.license && <div>{copyright.license}</div>}
            <div className="flex items-center gap-1 mt-2">
              <span>Built by</span>
              <Link 
                href="https://mihaicrisan-com.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline underline-offset-4 transition-colors"
              >
                Mihai Crisan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
