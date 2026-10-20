// Celebration GIFs, served from GIPHY at 200px height (WebP keeps them light).
// Swap ids here to change what shows up; find one on giphy.com and copy the id from its URL.
const GIFS = {
  allDone: [
    { id: 'g9582DNuQppxC', alt: 'Leonardo DiCaprio raising a glass in a toast' },
    { id: '3o6fJ1BM7R2EBRDnxK', alt: 'Michael Scott spraying confetti, captioned Congrats!' },
    { id: 'xT0xezQGU5xCDJuCPe', alt: 'Minions cheering, captioned Congratulations!' },
    { id: '26tOZ42Mg6pbTUPHW', alt: 'Fireworks bursting in the night sky' },
    { id: '26u4cqiYI30juCOGY', alt: 'Person holding up a trophy as confetti falls' },
    { id: 'artj92V8o75VPL7AeQ', alt: 'Woman clapping as confetti falls around her' },
  ],
  halfway: [
    { id: '3o7abKhOpu0NwenH3O', alt: 'SpongeBob eagerly rubbing his hands together' },
    { id: '3oz8xAFtqoOUUrsh7W', alt: 'Dancing flower mascot shouting Yeah!' },
    { id: 'l4q8cJzGdR9J8w3hS', alt: 'Crowd giving a standing ovation' },
  ],
  empty: [
    { id: 'kyLYXonQYYfwYDIeZl', alt: 'Elmo wearing a party hat' },
    { id: '111ebonMs90YLu', alt: 'Kid at a computer turning to give a thumbs up' },
  ],
};

export function pickGif(kind) {
  const list = GIFS[kind];
  const gif = list[Math.floor(Math.random() * list.length)];
  return { ...gif, url: `https://media.giphy.com/media/${gif.id}/200.webp` };
}

export const CHEERS = ['Nice work!', 'One down ✓', 'Crushed it', 'Keep it rolling', 'Done and dusted', 'Another one ✓'];
