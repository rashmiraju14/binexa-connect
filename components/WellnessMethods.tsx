const methods = [
  { title: "Aerobic movement", description: "Activities such as walking and cycling that build endurance. Start at a comfortable level and increase gradually.", publisher: "NHS", url: "https://www.nhs.uk/live-well/exercise/" },
  { title: "Strength training", description: "Resistance work that challenges your muscles. Learn technique before adding difficulty.", publisher: "NHS", url: "https://www.nhs.uk/live-well/exercise/how-to-improve-strength-flexibility/" },
  { title: "Balance and mobility", description: "Controlled movement and balance practice. Use appropriate support and choose exercises that match your ability.", publisher: "NHS inform", url: "https://www.nhsinform.scot/healthy-living/preventing-falls/keeping-well/strength-and-balance-exercises/" },
  { title: "Yoga and mindful movement", description: "Yoga brings movement, attention, and breathing together. Styles vary in intensity; explore suitability and safety before choosing a class.", publisher: "NIH · NCCIH", url: "https://www.nccih.nih.gov/health/yoga-effectiveness-and-safety" },
  { title: "Pilates and movement control", description: "A structured approach to controlled movement. Start with a beginner class or explore chair-supported options.", publisher: "NHS", url: "https://www.nhs.uk/live-well/exercise/pilates-and-yoga/pilates-for-beginners/" },
  { title: "Gentle breathing", description: "A relaxation practice using comfortable, unforced breathing. Follow the NHS step-by-step guide at your own pace.", publisher: "NHS", url: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/" },
  { title: "Tai chi", description: "A movement practice involving posture and deliberate movements. Explore the evidence and safety considerations before starting.", publisher: "NIH · NCCIH", url: "https://www.nccih.nih.gov/health/tai-chi-what-you-need-to-know" },
];

export default function WellnessMethods() {
  return <section className="learning-section" aria-labelledby="wellness-methods-title">
    <div className="learning-heading"><h2 id="wellness-methods-title">Explore wellness approaches</h2><p>Understand the method behind a practice, then choose an appropriate guide or class. These introductions are educational, rather than a personalized exercise plan.</p></div>
    <div className="cardgrid">{methods.map(method => <article className="card" key={method.title}><span className="pill">Practice guide</span><h3>{method.title}</h3><p>{method.description}</p><a className="textlink" href={method.url} target="_blank" rel="noopener noreferrer">Explore with {method.publisher} ↗</a></article>)}</div>
  </section>;
}
