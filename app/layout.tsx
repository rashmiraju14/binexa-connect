import type {Metadata} from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import './globals.css';
export const metadata: Metadata={title:{default:'Binexa Connect | Binexa Health',template:'%s | Binexa Connect'},description:'A Binexa Health community for wellness education, health technology, resources, and meaningful conversations.',icons:{icon:'/brand/binexa-favicon.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Header/>{children}<footer className="footer"><div className="shell footrow"><div><b>Binexa Connect</b><br/><small>By Binexa Health · Learn. Connect. Thrive.</small></div><div className="footlinks"><Link href="/resources">Resources</Link><Link href="/events">Events</Link><Link href="/join">Join</Link></div><small>For education only. Not medical advice.</small></div></footer></body></html>}
