import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tracks = [
  // Rock
  { title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration_seconds: 355, genre: 'Rock' },
  { title: 'Stairway to Heaven', artist: 'Led Zeppelin', album: 'Led Zeppelin IV', duration_seconds: 482, genre: 'Rock' },
  { title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', duration_seconds: 391, genre: 'Rock' },
  { title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', album: 'Appetite for Destruction', duration_seconds: 356, genre: 'Rock' },
  { title: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind', duration_seconds: 301, genre: 'Rock' },
  { title: 'Wonderwall', artist: 'Oasis', album: '(What\'s the Story) Morning Glory?', duration_seconds: 258, genre: 'Rock' },
  { title: 'Don\'t Stop Believin\'', artist: 'Journey', album: 'Escape', duration_seconds: 251, genre: 'Rock' },
  
  // Pop
  { title: 'Shape of You', artist: 'Ed Sheeran', album: '÷', duration_seconds: 233, genre: 'Pop' },
  { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration_seconds: 200, genre: 'Pop' },
  { title: 'Watermelon Sugar', artist: 'Harry Styles', album: 'Fine Line', duration_seconds: 174, genre: 'Pop' },
  { title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration_seconds: 203, genre: 'Pop' },
  { title: 'Stay', artist: 'The Kid LAROI & Justin Bieber', album: 'F*CK LOVE 3', duration_seconds: 141, genre: 'Pop' },
  { title: 'Bad Guy', artist: 'Billie Eilish', album: 'When We All Fall Asleep, Where Do We Go?', duration_seconds: 194, genre: 'Pop' },
  { title: 'As It Was', artist: 'Harry Styles', album: 'Harry\'s House', duration_seconds: 167, genre: 'Pop' },
  
  // Electronic
  { title: 'One More Time', artist: 'Daft Punk', album: 'Discovery', duration_seconds: 320, genre: 'Electronic' },
  { title: 'Strobe', artist: 'deadmau5', album: 'For Lack of a Better Name', duration_seconds: 636, genre: 'Electronic' },
  { title: 'Levels', artist: 'Avicii', album: 'Levels', duration_seconds: 202, genre: 'Electronic' },
  { title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', duration_seconds: 242, genre: 'Electronic' },
  { title: 'Sandstorm', artist: 'Darude', album: 'Before the Storm', duration_seconds: 225, genre: 'Electronic' },
  { title: 'Bangarang', artist: 'Skrillex', album: 'Bangarang', duration_seconds: 194, genre: 'Electronic' },
  
  // Jazz
  { title: 'Take Five', artist: 'Dave Brubeck', album: 'Time Out', duration_seconds: 324, genre: 'Jazz' },
  { title: 'So What', artist: 'Miles Davis', album: 'Kind of Blue', duration_seconds: 562, genre: 'Jazz' },
  { title: 'Autumn Leaves', artist: 'Cannonball Adderley', album: 'Somethin\' Else', duration_seconds: 312, genre: 'Jazz' },
  { title: 'Blue Train', artist: 'John Coltrane', album: 'Blue Train', duration_seconds: 423, genre: 'Jazz' },
  { title: 'All of Me', artist: 'Billie Holiday', album: 'The Complete Billie Holiday', duration_seconds: 213, genre: 'Jazz' },
  
  // Classical
  { title: 'Moonlight Sonata', artist: 'Ludwig van Beethoven', album: 'Piano Sonata No. 14', duration_seconds: 900, genre: 'Classical' },
  { title: 'Four Seasons - Spring', artist: 'Antonio Vivaldi', album: 'The Four Seasons', duration_seconds: 210, genre: 'Classical' },
  { title: 'Claire de Lune', artist: 'Claude Debussy', album: 'Suite Bergamasque', duration_seconds: 300, genre: 'Classical' },
  { title: 'Canon in D', artist: 'Johann Pachelbel', album: 'Pachelbel\'s Canon', duration_seconds: 252, genre: 'Classical' },
  
  // Hip-Hop
  { title: 'Lose Yourself', artist: 'Eminem', album: '8 Mile Soundtrack', duration_seconds: 326, genre: 'Hip-Hop' },
  { title: 'Sicko Mode', artist: 'Travis Scott', album: 'Astroworld', duration_seconds: 312, genre: 'Hip-Hop' },
  { title: 'God\'s Plan', artist: 'Drake', album: 'Scorpion', duration_seconds: 198, genre: 'Hip-Hop' },
  { title: 'Juice', artist: 'Lizzo', album: 'Cuz I Love You', duration_seconds: 223, genre: 'Hip-Hop' },
  
  // R&B/Soul
  { title: 'A Change Is Gonna Come', artist: 'Sam Cooke', album: 'Ain\'t That Good News', duration_seconds: 199, genre: 'R&B' },
  { title: 'What\'s Going On', artist: 'Marvin Gaye', album: 'What\'s Going On', duration_seconds: 233, genre: 'R&B' },
  { title: 'Superstition', artist: 'Stevie Wonder', album: 'Talking Book', duration_seconds: 266, genre: 'R&B' },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.playlistTrack.deleteMany();
  await prisma.track.deleteMany();

  // Create tracks
  console.log('📀 Creating tracks...');
  const createdTracks = await Promise.all(
    tracks.map(track => prisma.track.create({ data: track }))
  );
  console.log(`✅ Created ${createdTracks.length} tracks`);

  // Create initial playlist (8-10 tracks)
  console.log('📝 Creating initial playlist...');
  const playlistTrackIds = [0, 1, 7, 8, 14, 16, 22, 28, 30, 33]; // Indices for diverse tracks
  const playlistItems = [];

  for (let i = 0; i < playlistTrackIds.length; i++) {
    const trackIndex = playlistTrackIds[i];
    const track = createdTracks[trackIndex];
    
    const playlistItem = await prisma.playlistTrack.create({
      data: {
        trackId: track.id,
        position: i + 1.0,
        votes: Math.floor(Math.random() * 13) - 2, // -2 to 10
        addedBy: i < 3 ? 'User123' : i < 6 ? 'User456' : 'Anonymous',
        isPlaying: i === 0, // First track is playing
        playedAt: i === 0 ? new Date() : null,
      },
    });

    playlistItems.push(playlistItem);
  }

  console.log(`✅ Created ${playlistItems.length} playlist items`);
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

