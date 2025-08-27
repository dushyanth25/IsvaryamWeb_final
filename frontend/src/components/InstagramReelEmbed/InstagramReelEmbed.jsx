import InstagramReelEmbed from '../components/InstagramReelEmbed';

const reels = [
  "https://www.instagram.com/reel/DLOvl5gyQhh/",
  "https://www.instagram.com/reel/C5zLAXWAIPl/"
];

// Inside your HomePage component return:
<div className="instagram-section">
  <h2>Latest from Instagram</h2>
  <div className="reels-container">
    {reels.map((url, idx) => (
      <InstagramReelEmbed key={idx} permalink={url} />
    ))}
  </div>
</div>
