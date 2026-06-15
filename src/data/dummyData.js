export const dummyCVs = [
  {
    id: 'cv-001',
    user_id: 'user-001',
    title: 'CV Software Engineer 2026',
    template_id: 'ats-clean-v1',
    data: {
      personal: {
        name: 'Reza Pratama',
        email: 'reza.pratama@email.com',
        phone: '+62 812-3456-7890',
        city: 'Jakarta',
        linkedin: 'linkedin.com/in/rezapratama',
        github: 'github.com/rezapratama',
        portfolio: 'rezapratama.dev',
      },
      summary: 'Full Stack Developer dengan pengalaman 3 tahun dalam pengembangan web menggunakan React.js dan Node.js. Terbiasa bekerja dalam tim agile dan membangun sistem high-traffic. Berkomitmen untuk menghasilkan kode berkualitas tinggi yang scalable dan maintainable.',
      experiences: [
        {
          company: 'PT Teknologi Nusantara',
          position: 'Frontend Developer',
          start_date: '2024-01',
          end_date: null,
          is_current: true,
          description: [
            'Mengembangkan dashboard admin dengan React.js yang melayani 50.000+ pengguna aktif harian',
            'Mengimplementasikan state management menggunakan Zustand, mengurangi re-render tidak perlu sebesar 40%',
            'Berkolaborasi dengan tim desain untuk mengimplementasikan UI/UX yang responsif dan aksesibel',
            'Melakukan code review dan mentoring untuk 3 developer junior',
          ],
        },
        {
          company: 'PT Startup Digital',
          position: 'Junior Web Developer',
          start_date: '2023-01',
          end_date: '2024-12',
          is_current: false,
          description: [
            'Membangun REST API dengan Express.js dan PostgreSQL untuk platform e-commerce',
            'Mengintegrasikan payment gateway (Midtrans) yang memproses 1.000+ transaksi per hari',
            'Menulis unit test dengan Jest mencapai coverage 85%',
            'Mengoptimalkan performa database query, mengurangi response time dari 2s menjadi 200ms',
          ],
        },
      ],
      educations: [
        {
          institution: 'Universitas Indonesia',
          degree: 'Sarjana',
          field: 'Teknik Informatika',
          start_year: '2019',
          end_year: '2023',
          gpa: '3.78',
        },
      ],
      skills: {
        technical: ['React.js', 'Node.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS', 'Git', 'Docker', 'REST API'],
        soft: ['Komunikasi', 'Kerja Tim', 'Problem Solving', 'Manajemen Waktu', 'Adaptabilitas'],
      },
      projects: [
        {
          name: 'Sistem Manajemen Inventaris',
          description: 'Aplikasi web untuk manajemen stok barang dengan fitur real-time tracking dan laporan otomatis',
          tech_stack: ['React.js', 'Express.js', 'PostgreSQL', 'Socket.io'],
          url: 'github.com/rezapratama/inventory-system',
        },
        {
          name: 'Platform Belajar Online',
          description: 'Platform kursus online dengan fitur video streaming, kuis interaktif, dan sertifikat digital',
          tech_stack: ['Next.js', 'Firebase', 'Tailwind CSS', 'Stripe'],
          url: 'belajar-online.vercel.app',
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          date: '2025-03',
        },
        {
          name: 'Google Associate Android Developer',
          issuer: 'Google',
          date: '2024-08',
        },
      ],
    },
    created_at: '2026-06-01T08:00:00Z',
    updated_at: '2026-06-10T14:30:00Z',
  },
  {
    id: 'cv-002',
    user_id: 'user-001',
    title: 'CV Backend Developer 2026',
    template_id: 'ats-modern-v1',
    data: {
      personal: {
        name: 'Reza Pratama',
        email: 'reza.pratama@email.com',
        phone: '+62 812-3456-7890',
        city: 'Jakarta',
        linkedin: 'linkedin.com/in/rezapratama',
        github: 'github.com/rezapratama',
      },
      summary: 'Backend Developer dengan fokus pada arsitektur microservice dan sistem terdistribusi. Berpengalaman dalam membangun API yang melayani jutaan request per hari.',
      experiences: [
        {
          company: 'PT Teknologi Nusantara',
          position: 'Backend Developer',
          start_date: '2024-06',
          end_date: null,
          is_current: true,
          description: [
            'Merancang dan mengimplementasikan microservice architecture menggunakan Node.js dan RabbitMQ',
            'Mengelola database PostgreSQL dengan 100+ tabel dan mengoptimalkan query kompleks',
            'Mengimplementasikan caching dengan Redis, mengurangi beban database sebesar 60%',
          ],
        },
      ],
      educations: [
        {
          institution: 'Universitas Indonesia',
          degree: 'Sarjana',
          field: 'Teknik Informatika',
          start_year: '2019',
          end_year: '2023',
          gpa: '3.78',
        },
      ],
      skills: {
        technical: ['Node.js', 'Express.js', 'PostgreSQL', 'Redis', 'Docker', 'RabbitMQ', 'AWS', 'Microservices'],
        soft: ['Analitis', 'Dokumentasi', 'Kolaborasi', 'Mentoring'],
      },
      projects: [],
      certifications: [],
    },
    created_at: '2026-06-05T10:00:00Z',
    updated_at: '2026-06-08T16:00:00Z',
  },
  {
    id: 'cv-003',
    user_id: 'user-001',
    title: 'CV Fresh Graduate 2026',
    template_id: 'ats-clean-v1',
    data: {
      personal: {
        name: 'Reza Pratama',
        email: 'reza.pratama@email.com',
        phone: '+62 812-3456-7890',
        city: 'Depok',
        linkedin: 'linkedin.com/in/rezapratama',
        github: 'github.com/rezapratama',
      },
      summary: 'Fresh Graduate Teknik Informatika Universitas Indonesia dengan minat besar di bidang pengembangan web. Aktif dalam organisasi dan proyek freelance selama masa kuliah.',
      experiences: [],
      educations: [
        {
          institution: 'Universitas Indonesia',
          degree: 'Sarjana',
          field: 'Teknik Informatika',
          start_year: '2019',
          end_year: '2023',
          gpa: '3.78',
        },
      ],
      skills: {
        technical: ['HTML/CSS', 'JavaScript', 'React.js', 'Node.js', 'Git', 'MySQL'],
        soft: ['Belajar Cepat', 'Kerja Tim', 'Komunikasi', 'Inisiatif'],
      },
      projects: [
        {
          name: 'Aplikasi Donasi Online',
          description: 'Platform crowdfunding untuk donasi bencana alam dengan fitur real-time update',
          tech_stack: ['React.js', 'Node.js', 'MongoDB', 'Socket.io'],
          url: 'github.com/rezapratama/donasi-online',
        },
      ],
      certifications: [],
    },
    created_at: '2026-05-20T09:00:00Z',
    updated_at: '2026-06-01T11:00:00Z',
  },
]

export const dummyLetters = [
  {
    id: 'letter-001',
    user_id: 'user-001',
    cv_id: 'cv-001',
    position: 'Frontend Developer',
    company: 'PT Gojek Indonesia',
    content: `Dengan hormat,

Saya menulis surat ini untuk menyatakan ketertarikan saya melamar posisi Frontend Developer di PT Gojek Indonesia. Sebagai Full Stack Developer dengan pengalaman 3 tahun dalam pengembangan web, saya yakin dapat memberikan kontribusi yang signifikan bagi tim engineering Gojek.

Dalam peran saya saat ini sebagai Frontend Developer di PT Teknologi Nusantara, saya telah berhasil mengembangkan dashboard admin yang melayani 50.000+ pengguna aktif harian menggunakan React.js. Saya juga mengimplementasikan state management dengan Zustand yang berhasil mengurangi re-render tidak perlu sebesar 40%, meningkatkan performa aplikasi secara signifikan.

Saya sangat tertarik dengan ekosistem teknologi Gojek yang kompleks dan berdampak besar pada kehidupan masyarakat. Pengalaman saya dalam menangani sistem high-traffic dan optimalisasi performa frontend sangat relevan dengan tantangan teknis di Gojek.

Besar harapan saya dapat bergabung dan berkontribusi dalam tim Frontend Gojek. Terima kasih atas waktu dan pertimbangan Bapak/Ibu.

Hormat saya,
Reza Pratama`,
    created_at: '2026-06-10T09:00:00Z',
    updated_at: '2026-06-10T09:00:00Z',
  },
  {
    id: 'letter-002',
    user_id: 'user-001',
    cv_id: 'cv-001',
    position: 'Software Engineer',
    company: 'PT Tokopedia',
    content: `Dengan hormat,

Saya menulis surat lamaran ini untuk posisi Software Engineer di PT Tokopedia. Dengan latar belakang pendidikan Teknik Informatika dan pengalaman kerja di bidang pengembangan web, saya percaya diri dapat memberikan nilai tambah bagi tim Tokopedia.

Selama 3 tahun terakhir, saya telah mengembangkan berbagai aplikasi web menggunakan React.js dan Node.js. Salah satu pencapaian terbesar saya adalah membangun REST API yang memproses 1.000+ transaksi per hari di perusahaan sebelumnya. Saya juga terbiasa bekerja dalam tim agile dan melakukan code review secara rutin.

Saya mengagumi bagaimana Tokopedia telah menjadi platform e-commerce terdepan di Indonesia. Saya ingin berkontribusi dalam membangun fitur-fitur yang memudahkan jutaan pengguna Tokopedia bertransaksi setiap hari.

Terima kasih atas kesempatan yang diberikan. Saya menantikan kesempatan untuk dapat berbicara lebih lanjut dalam wawancara.

Hormat saya,
Reza Pratama`,
    created_at: '2026-06-08T14:00:00Z',
    updated_at: '2026-06-08T14:00:00Z',
  },
]

export const dummyTemplates = [
  {
    id: 'ats-clean-v1',
    name: 'ATS Clean',
    description: 'Format minimalis satu kolom, 100% ATS-friendly',
    is_active: true,
  },
  {
    id: 'ats-modern-v1',
    name: 'ATS Modern',
    description: 'Modern dengan aksen warna tipis, tetap ATS-safe',
    is_active: true,
  },
]
