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

/**
 * Standalone resume preview page (/resume).
 *
 * Deliberately decoupled from the home page: NOT wrapped in <Layout>, so no
 * Navbar / background orbs / back-to-top / Lenis reveal. Hardcoded light
 * theme (white paper, dark ink) — ignores useColorScheme so it always looks
 * like a printed résumé. Content is English placeholder text for layout
 * testing; the user will replace it. Print via browser (Ctrl+P) uses the
 * inline @media print rules below.
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

const ExperienceItem: React.FC<{
  company: string;
  type: string;
  position: string;
  period: string;
  description: string;
}> = ({ company, type, position, period, description }) => (
  <Box sx={{ borderLeft: `2px solid ${LINE}`, pl: 2, mb: 2.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Box>
        <Typography component="span" sx={{ fontWeight: 700, color: INK, fontSize: '1rem' }}>
          {company}
        </Typography>
        <Typography component="span" sx={{ color: SUB, fontSize: '0.85rem', ml: 1 }}>
          {type}
        </Typography>
      </Box>
      <Typography sx={{ color: SUB, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{period}</Typography>
    </Box>
    <Typography sx={{ color: INK, fontSize: '0.9rem', fontWeight: 500, mt: 0.25 }}>{position}</Typography>
    <Typography sx={{ color: SUB, fontSize: '0.85rem', lineHeight: 1.6, mt: 0.5 }}>{description}</Typography>
  </Box>
);

const EducationItem: React.FC<{
  institution: string;
  degree: string;
  period: string;
}> = ({ institution, degree, period }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5 }}>
    <Box>
      <Typography sx={{ fontWeight: 700, color: INK, fontSize: '0.95rem' }}>{institution}</Typography>
      <Typography sx={{ color: SUB, fontSize: '0.85rem' }}>{degree}</Typography>
    </Box>
    <Typography sx={{ color: SUB, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{period}</Typography>
  </Box>
);

const ProjectCard: React.FC<{
  name: string;
  description: string;
  tags: string[];
}> = ({ name, description, tags }) => (
  <Box
    sx={{
      border: `1px solid ${LINE}`,
      borderRadius: 1.5,
      p: 2,
    }}
  >
    <Typography sx={{ fontWeight: 700, color: INK, fontSize: '0.95rem', mb: 0.5 }}>{name}</Typography>
    <Typography sx={{ color: SUB, fontSize: '0.8rem', lineHeight: 1.5, mb: 1 }}>{description}</Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
      {tags.map((tag) => (
        <Typography
          key={tag}
          component="span"
          sx={{
            fontSize: '0.7rem',
            color: SUB,
            border: `1px solid ${LINE}`,
            borderRadius: 999,
            px: 1,
            py: 0.25,
          }}
        >
          {tag}
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: INK, lineHeight: 1.1 }}>
              RaymondzyLei
            </Typography>
            <Typography sx={{ color: SUB, fontSize: '1.05rem', mt: 0.5 }}>Student & Developer</Typography>
            <Typography sx={{ color: SUB, fontSize: '0.85rem', mt: 0.25 }}>Hefei, China</Typography>
          </Box>
          <Avatar
            src="/avatar.jpg"
            alt="RaymondzyLei"
            variant="rounded"
            sx={{ width: 96, height: 96, flexShrink: 0 }}
          />
        </Box>

        {/* Contact icons */}
        <Box className="no-print" sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
          <IconButton
            href="mailto:raymond.zy.lei@outlook.com"
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ border: `1px solid ${LINE}`, borderRadius: '50%', color: INK }}
          >
            <EmailIcon sx={{ fontSize: 20 }} />
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
            A dedicated first-year undergraduate student at USTC passionate about computer science,
            algorithms, and building tools that solve real problems. Active in academic competitions
            and always eager to learn cutting-edge technologies.
          </Typography>
        </section>

        {/* Experience */}
        <section>
          <SectionTitle>Experience</SectionTitle>
          <ExperienceItem
            company="Placeholder Lab"
            type="· Internship"
            position="Software Engineer Intern"
            period="Summer 2026"
            description="Worked on placeholder projects involving React, TypeScript, and developer tooling. This is placeholder text — replace with your real experience."
          />
          <ExperienceItem
            company="Open Source"
            type="· Contributor"
            position="Course Arrangement Tool"
            period="2025 - Present"
            description="Built a course selection and scheduling tool for USTC students. Placeholder description — replace with your real experience."
          />
        </section>

        {/* Education */}
        <section>
          <SectionTitle>Education</SectionTitle>
          <EducationItem
            institution="University of Science and Technology of China (USTC)"
            degree="B.Eng. in Computer Science and Technology"
            period="2025 - Present"
          />
          <EducationItem
            institution="Guangzhou No.6 Middle School"
            degree="Senior High School Education"
            period="2023 - 2025"
          />
        </section>

        {/* Skills */}
        <section>
          <SectionTitle>Skills</SectionTitle>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {['C++', 'Rust', 'Python', 'JS/TS', 'HTML/CSS', 'React', 'Git', 'Docker'].map((skill) => (
              <Typography
                key={skill}
                component="span"
                sx={{
                  bgcolor: CHIP_BG,
                  color: CHIP_INK,
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  borderRadius: 999,
                  px: 1.5,
                  py: 0.5,
                }}
              >
                {skill}
              </Typography>
            ))}
          </Box>
        </section>

        {/* Projects */}
        <section>
          <SectionTitle>Projects</SectionTitle>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <ProjectCard
              name="USTC Course Arrangement Tool"
              description="A course selection and scheduling tool. Placeholder — replace with your real project description."
              tags={['React', 'TypeScript']}
            />
            <ProjectCard
              name="Placeholder Project"
              description="Another placeholder project for layout testing. Replace with your real project."
              tags={['Placeholder', 'Tag']}
            />
          </Box>
        </section>

        {/* Awards */}
        <section>
          <SectionTitle>Awards</SectionTitle>
          <ExperienceItem
            company="Second Prize, China Algorithm Capability Competition"
            type="· National Level"
            position="Final Contest"
            period="Spring 2026"
            description="Placeholder award — replace with your real awards."
          />
          <ExperienceItem
            company="First Prize, Chinese Physics Olympiad"
            type="· Provincial Level"
            position=""
            period="2024"
            description=""
          />
        </section>
      </Box>
    </>
  );
};
