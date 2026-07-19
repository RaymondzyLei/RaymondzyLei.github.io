import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import GlobalStyles from '@mui/material/GlobalStyles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

/**
 * Standalone resume preview page (/resume).
 *
 * Deliberately decoupled from the home page: NOT wrapped in <Layout>, so no
 * Navbar / background orbs / back-to-top / Lenis reveal. Hardcoded light
 * theme (white paper, dark ink) — ignores useColorScheme so it always looks
 * like a printed résumé. Content mirrors resume.typ (the source of truth);
 * print via browser (Ctrl+P) uses the inline @media print rules below.
 */

// Hardcoded light palette — no theme dependency.
const INK = '#1a1a1a';
const SUB = '#6b7280';
const LINE = '#e5e7eb';
const PAPER = '#ffffff';
const CHIP_BG = '#1f2937';
const CHIP_INK = '#ffffff';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    sx={{
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontSize: '0.8rem',
      fontWeight: 700,
      color: SUB,
      borderBottom: `1px solid ${LINE}`,
      pb: 0.5,
      mb: 2,
      mt: 5,
    }}
  >
    {children}
  </Typography>
);

const EducationItem: React.FC<{
  institution: string;
  location: string;
  degree: string;
  period: string;
  bullets: string[];
}> = ({ institution, location, degree, period, bullets }) => (
  <Box sx={{ mb: 2.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
      <Box>
        <Typography component="span" sx={{ fontWeight: 700, color: INK, fontSize: '1rem' }}>
          {institution}
        </Typography>
        <Typography component="span" sx={{ color: SUB, fontSize: '0.85rem', ml: 1 }}>
          {location}
        </Typography>
      </Box>
      <Typography sx={{ color: SUB, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
        {period}
      </Typography>
    </Box>
    <Typography sx={{ color: INK, fontSize: '0.9rem', mt: 0.25 }}>{degree}</Typography>
    <Box component="ul" sx={{ m: 0, pl: 3, mt: 0.5 }}>
      {bullets.map((b) => (
        <Box
          component="li"
          key={b}
          sx={{ color: SUB, fontSize: '0.85rem', lineHeight: 1.6, mt: 0.25 }}
        >
          {b}
        </Box>
      ))}
    </Box>
  </Box>
);

const AwardItem: React.FC<{
  title: string;
  level: string;
  date: string;
  details: string;
}> = ({ title, level, date, details }) => (
  <Box sx={{ borderLeft: `2px solid ${LINE}`, pl: 2, mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
      <Typography sx={{ fontWeight: 700, color: INK, fontSize: '0.95rem' }}>{title}</Typography>
      <Typography sx={{ color: SUB, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{date}</Typography>
    </Box>
    <Typography sx={{ color: SUB, fontSize: '0.85rem', mt: 0.25 }}>{level}</Typography>
    {details && (
      <Typography sx={{ color: SUB, fontSize: '0.8rem', mt: 0.25 }}>{details}</Typography>
    )}
  </Box>
);

const SkillGroup: React.FC<{ label: string; items: { text: string; strong?: boolean }[] }> = ({
  label,
  items,
}) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography sx={{ fontWeight: 700, color: INK, fontSize: '0.85rem', mb: 0.75 }}>
      {label}
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {items.map((item) => (
        <Typography
          key={item.text}
          component="span"
          sx={{
            fontSize: '0.8rem',
            fontWeight: item.strong ? 700 : 400,
            bgcolor: item.strong ? CHIP_BG : 'transparent',
            color: item.strong ? CHIP_INK : INK,
            border: `1px solid ${item.strong ? CHIP_BG : LINE}`,
            borderRadius: 999,
            px: 1.5,
            py: 0.5,
          }}
        >
          {item.text}
        </Typography>
      ))}
    </Box>
  </Box>
);

export const ResumePage: React.FC = () => {
  return (
    <>
      <GlobalStyles
        styles={`
          body { background: ${PAPER}; }
          @media print {
            @page { size: A4; margin: 1.5cm; }
            .no-print { display: none !important; }
            .resume-paper {
              box-shadow: none !important;
              border-radius: 0 !important;
              max-width: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `}
      />
      <Box
        className="no-print"
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: INK,
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
            '&:hover': { color: SUB },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '1.1rem' }} />
          Back to Home
        </Link>
      </Box>

      <Box
        className="resume-paper"
        sx={{
          maxWidth: 768,
          mx: 'auto',
          my: { xs: 3, md: 6 },
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
          bgcolor: PAPER,
          color: INK,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          borderRadius: 2,
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: INK, lineHeight: 1.1 }}>
              Lei Zhangyue
            </Typography>
            <Typography sx={{ color: SUB, fontSize: '1.05rem', mt: 0.5 }}>
              Student & Developer
            </Typography>
            <Typography sx={{ color: SUB, fontSize: '0.85rem', mt: 0.25 }}>
              Hefei, Anhui, China
            </Typography>
          </Box>
          <Avatar
            src="/avatar.jpg"
            alt="Lei Zhangyue"
            variant="rounded"
            sx={{ width: 96, height: 96, flexShrink: 0 }}
          />
        </Box>

        {/* Contact icons */}
        <Box className="no-print" sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
          <IconButton
            href="mailto:raymond.lei@mail.ustc.edu.cn"
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ border: `1px solid ${LINE}`, borderRadius: '50%', color: INK }}
          >
            <EmailIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton
            href="tel:+8615918530509"
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ border: `1px solid ${LINE}`, borderRadius: '50%', color: INK }}
          >
            <PhoneIcon sx={{ fontSize: 20 }} />
          </IconButton>
          <IconButton
            href="https://github.com/RaymondzyLei"
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ border: `1px solid ${LINE}`, borderRadius: '50%', color: INK }}
          >
            <GitHubIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* About */}
        <section>
          <SectionTitle>About</SectionTitle>
          <Typography sx={{ color: INK, fontSize: '0.9rem', lineHeight: 1.7 }}>
            First-year undergraduate at the School of the Gifted Young College, USTC, with a solid
            academic foundation in computer science and strong self-directed learning capabilities.
            Hold a profound curiosity for cutting-edge science and technology, and eager to apply
            theoretical knowledge to solve real-world problems.
          </Typography>
        </section>

        {/* Education */}
        <section>
          <SectionTitle>Education</SectionTitle>
          <EducationItem
            institution="University of Science and Technology of China (USTC)"
            location="Hefei, Anhui, China"
            degree="B.Eng. in Computer Science and Technology, School of the Gifted Young College"
            period="2025 - Present"
            bullets={[
              'Currently a first-year undergraduate student with a solid academic foundation in computer science-related basic courses',
              'Active in academic competitions and independent learning of cutting-edge computer science knowledge',
            ]}
          />
          <EducationItem
            institution="Guangzhou No.6 Middle School"
            location="Guangzhou, Guangdong, China"
            degree="Senior High School Education"
            period="2023 - 2025"
            bullets={[
              'Completed high school curriculum with outstanding academic performance in Physics and Mathematics',
              'Ranked among the top students in science-related subjects',
            ]}
          />
        </section>

        {/* Awards & Achievements */}
        <section>
          <SectionTitle>Awards & Achievements</SectionTitle>
          <AwardItem
            title="Second Prize, China Algorithm Capability Competition (Final Contest)"
            level="National Level, China"
            date="Spring 2026"
            details="The 2nd Session, First-Year Undergraduate Period"
          />
          <AwardItem
            title="Second Prize, China Algorithm Capability Competition (Regional Contest)"
            level="National Level, China"
            date="Fall 2025"
            details="The 2nd Session, First-Year Undergraduate Period"
          />
          <AwardItem
            title="First Prize, Chinese Physics Olympiad"
            level="Provincial Level, China"
            date="Senior 2, 2024"
            details="The 41st Session, Senior High School Period"
          />
          <AwardItem
            title="Third Prize, Chinese Mathematical Olympiad"
            level="Preliminary Round, China"
            date="Senior 2, 2024"
            details="The 2024 Session, Senior High School Period"
          />
        </section>

        {/* Academic Profile */}
        <section>
          <SectionTitle>Academic Profile</SectionTitle>
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            <Box component="li" sx={{ color: INK, fontSize: '0.9rem', lineHeight: 1.6 }}>
              Overall GPA 3.72/4.30, Major Ranking 27/147
            </Box>
          </Box>
        </section>

        {/* Skills */}
        <section>
          <SectionTitle>Skills</SectionTitle>
          <SkillGroup
            label="Programming Languages"
            items={[
              { text: 'C++', strong: true },
              { text: 'Python', strong: true },
              { text: 'Rust' },
              { text: 'TypeScript' },
            ]}
          />
          <SkillGroup label="Languages" items={[{ text: 'TOEFL: 97' }]} />
        </section>
      </Box>
    </>
  );
};
