import { Headphones } from "lucide-react";
import styles from "./PodcastCover.module.css";

export default function PodcastCover({ title, category }: { title: string; category: string }) {
  return <div className={styles.cover} role="img" aria-label={`Binexa Connect library cover: ${title}`}>
    <span className={styles.brand}>Binexa<span>Connect</span></span>
    <div className={styles.center}><span className={styles.icon}><Headphones size={30} strokeWidth={1.3} aria-hidden="true" /></span><span className={styles.label}>THE LISTENING COLLECTION</span></div>
    <span className={styles.category}>{category}</span>
  </div>;
}
