import { Button } from "@/components/ui/button"
import { Instagram, Facebook } from "lucide-react"
import Link from "next/link"

interface FooterProps {
  logo: React.ReactNode
  brandName?: string
}

const socialLinks = [
  {
    icon: <Instagram className="h-5 w-5" />,
    href: "https://www.instagram.com/rentn_go.ro",
    label: "Instagram",
  },
  {
    icon: <Facebook className="h-5 w-5" />,
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
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
]

const copyright = {
  text: "© 2024 RentNGo Cluj",
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
          <ul className="flex list-none mt-6 md:mt-0 space-x-3">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  asChild
                >
                  <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
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
          </div>
        </div>
      </div>
    </footer>
  )
}
