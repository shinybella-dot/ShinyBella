import Link from 'next/link';
import { MapPin, Phone, Mail, MessageSquare, Camera, Music, MapPin as MapPinIcon } from 'lucide-react';

const footerLinks = {
  empresa: [
    { href: '#', label: 'Nosotros' },
    { href: '#', label: 'Blog' },
    { href: '#', label: 'Prensa' },
    { href: '#', label: 'Carreras' },
  ],
  soporte: [
    { href: '#', label: 'Centro de ayuda' },
    { href: '#', label: 'Contacto' },
    { href: '#', label: 'Preguntas frecuentes' },
    { href: '#', label: 'Términos y condiciones' },
  ],
  legal: [
    { href: '#', label: 'Privacidad' },
    { href: '#', label: 'Términos de uso' },
    { href: '#', label: 'Cookies' },
  ],
  redes: [
    { href: 'https://www.facebook.com', label: 'Facebook', icon: MessageSquare },
    { href: 'https://www.instagram.com', label: 'Instagram', icon: Camera },
    { href: 'https://www.tiktok.com', label: 'TikTok', icon: Music },
  ],
};

const contactInfo = {
  direccion: 'Santa Ana Centro, El Salvador',
  telefono: '+503 2200-0000',
  email: 'hola@shinybella.com',
};

export default function Footer() {
  return (
    <footer className="bg-primary text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4" aria-label="ShinyBella - Inicio">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <MapPinIcon className="w-6 h-6" aria-hidden="true" />
              </div>
              <span className="font-bold text-xl">ShinyBella</span>
            </Link>
            <p className="text-warm-steel/80 text-sm mb-6 max-w-xs">
              Tu cita de belleza en un clic. Conectamos usuarios con los mejores salones y barberías de Santa Ana.
            </p>
            <div className="flex gap-4">
              {footerLinks.redes.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-warm-steel/80 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Soporte</h3>
            <ul className="space-y-2">
              {footerLinks.soporte.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-warm-steel/80 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-warm-steel/80 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <address className="not-italic space-y-3 text-warm-steel/80 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{contactInfo.direccion}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <a href={`tel:${contactInfo.telefono}`} className="hover:text-white transition-colors">
                  {contactInfo.telefono}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-white transition-colors">
                  {contactInfo.email}
                </a>
              </div>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-warm-steel/60 text-sm">
            © {new Date().getFullYear()} ShinyBella. Todos los derechos reservados.
          </p>
          <p className="text-warm-steel/60 text-sm">
            Hecho con ❤️ en El Salvador
          </p>
        </div>
      </div>
    </footer>
  );
}