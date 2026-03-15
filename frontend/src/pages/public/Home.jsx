import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Upload, Brain, BarChart3, Shield, Target,
  Zap, Users, FileText, TrendingUp, CheckCircle2, Play,
  ChevronRight, Star, Code2, Cpu, Database, GitBranch
} from 'lucide-react';
import Button from '../../components/common/Button';

// Stagger animation variants
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

// Scroll-triggered section wrapper
const RevealSection = ({ children, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Typing effect component
const TypingText = ({ texts }) => {
  const [currentTextIdx, setCurrentTextIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[currentTextIdx];
    let timeout;
    if (!isDeleting) {
      if (displayed.length < currentText.length) {
        timeout = setTimeout(() => setDisplayed(currentText.slice(0, displayed.length + 1)), 60);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
      } else {
        setIsDeleting(false);
        setCurrentTextIdx((prev) => (prev + 1) % texts.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, currentTextIdx, texts]);

  return (
    <span className="font-mono text-sm text-emerald-400">
      {displayed}<span className="typing-cursor" />
    </span>
  );
};

const Home = () => {
  const navigate = useNavigate();

  const pipelineSteps = [
    { icon: FileText, label: 'Post Job', desc: 'Recruiter creates job posting with requirements', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Cpu, label: 'Generate Embedding', desc: 'Job description encoded via sentence-transformers', color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { icon: Upload, label: 'Upload Resume', desc: 'Candidate uploads resume (PDF/DOCX)', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: Brain, label: 'Gemini Parsing', desc: 'AI extracts structured data from resume', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: Database, label: 'Embed Resume', desc: 'Resume text encoded to embedding space', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { icon: Target, label: 'Cosine Similarity', desc: 'Semantic alignment score computed', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: BarChart3, label: 'Ranked Output', desc: 'Candidates ranked by weighted match score', color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  const features = [
    { icon: Brain, title: 'Semantic Understanding', desc: 'Goes beyond keywords — understands context, nuance, and transferable skills using sentence-transformer embeddings.' },
    { icon: Shield, title: 'Bias Reduction', desc: 'Objective scoring based purely on qualifications and skill alignment, not names or demographics.' },
    { icon: Zap, title: 'Background Processing', desc: 'Redis-powered async processing. Upload and go — your rankings appear within seconds.' },
    { icon: Code2, title: 'FastAPI Backend', desc: 'Production-grade Python backend with async endpoints, Redis workers, and robust error handling.' },
    { icon: GitBranch, title: 'Dual Scoring', desc: 'Combined cosine similarity and keyword matching for comprehensive, multi-signal ranking.' },
    { icon: TrendingUp, title: 'Analytics Dashboard', desc: 'Visual breakdowns of score distributions, skill matches, and hiring pipeline insights.' },
  ];

  const stats = [
    { value: '94%', label: 'Accuracy Rate', desc: 'in matching quality candidates' },
    { value: '< 5s', label: 'Processing Time', desc: 'per resume analysis' },
    { value: '10x', label: 'Faster Screening', desc: 'compared to manual review' },
    { value: '50+', label: 'Skill Dimensions', desc: 'for semantic matching' },
  ];

  const testimonials = [
    { name: 'Sarah Chen', role: 'VP of Engineering, TechFlow', quote: 'Replaced hours of manual resume screening with intelligent, ranked shortlists. Our time-to-hire dropped by 40%.', avatar: 'SC' },
    { name: 'Marcus Johnson', role: 'Head of Talent, Axion Labs', quote: 'The semantic matching is remarkable. It surfaces candidates we would have overlooked with traditional keyword filters.', avatar: 'MJ' },
    { name: 'Priya Sharma', role: 'CTO, DataMesh', quote: 'Built for engineers, by people who understand AI. The embedding pipeline is elegant and the results speak for themselves.', avatar: 'PS' },
  ];

  // Mockup candidate data
  const mockCandidates = [
    { name: 'Alex Rivera', score: 0.94, status: 'Embedding Ready', skills: ['Python', 'ML', 'FastAPI'] },
    { name: 'Jamie Park', score: 0.87, status: 'Parsed', skills: ['React', 'Node', 'TypeScript'] },
    { name: 'Morgan Liu', score: 0.82, status: 'Scoring', skills: ['PyTorch', 'NLP', 'Redis'] },
  ];

  return (
    <div className="overflow-hidden">

      {/* ======= HERO SECTION ======= */}
      <section className="relative min-h-[90vh] flex items-center justify-center py-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary-500/[0.06] blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/[0.04] blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            {/* Left: Copy */}
            <div className="max-w-2xl">
              <motion.div variants={fadeUp} className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium">
                  <Sparkles className="w-4 h-4" /> Powered by AI & Sentence Transformers
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-5xl sm:text-6xl lg:text-[64px] font-heading font-semibold text-dark-50 leading-[1.1] tracking-[-0.02em] mb-6"
              >
                AI-powered resume intelligence for{' '}
                <span className="text-gradient">modern recruiters</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg text-dark-300 leading-relaxed mb-8 max-w-xl"
              >
                From resume upload to ranked shortlist in seconds. Semantic embeddings, cosine similarity scoring, and Gemini-powered parsing — built on FastAPI and Redis.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  onClick={() => navigate('/register')}
                  className="shadow-xl shadow-indigo-500/20 text-base"
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  icon={Play}
                  onClick={() => navigate('/about')}
                  className="text-base"
                >
                  See How It Works
                </Button>
              </motion.div>

              {/* Activity log typing effect */}
              <motion.div variants={fadeUp} className="mt-10 p-4 rounded-2xl bg-dark-800 border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                  <span className="text-xs text-dark-400 font-medium uppercase tracking-wider">Live Pipeline</span>
                </div>
                <TypingText texts={[
                  '→ Processing resume_alex_rivera.pdf',
                  '→ Generating embeddings via sentence-transformers',
                  '→ Cosine similarity: 0.94 ✓',
                  '→ Job match: Senior ML Engineer  ●  Ranked #1',
                  '→ Background worker: embedding pipeline complete',
                ]} />
              </motion.div>
            </div>

            {/* Right: Glassmorphism Dashboard Mockup */}
            <motion.div
              variants={fadeUp}
              className="hidden lg:block perspective-container"
            >
              <div className="relative">
                {/* Radial glow behind */}
                <div className="absolute inset-0 radial-glow-indigo scale-110" />

                <motion.div
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="perspective-card"
                >
                  <div className="bg-dark-800/90 backdrop-blur-xl rounded-3xl border border-white/[0.08] p-6 shadow-2xl shadow-black/40">
                    {/* Mock header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      </div>
                      <div className="flex-1 text-center text-xs text-dark-500 font-mono">Candidate Rankings — Senior ML Engineer</div>
                    </div>

                    {/* Candidate rows */}
                    <div className="space-y-3">
                      {mockCandidates.map((c, i) => (
                        <motion.div
                          key={c.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 + i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                          className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600/80 to-blue-500/80 text-white text-xs font-bold">
                            #{i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-dark-50">{c.name}</div>
                            <div className="flex gap-1.5 mt-1">
                              {c.skills.map(s => (
                                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary-500/10 text-primary-400 font-medium">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-mono font-bold text-emerald-400">
                              {(c.score * 100).toFixed(0)}%
                            </div>
                            <div className="text-[10px] text-dark-500">{c.status}</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Mock status bar */}
                    <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/[0.04]">
                      <span className="text-[10px] text-dark-500 font-mono">3 candidates processed</span>
                      <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Embedding Ready
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ======= STATS SECTION ======= */}
      <section className="relative py-20 bg-dark-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <RevealSection className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="text-center p-6 rounded-2xl bg-dark-800 border border-white/[0.06]"
              >
                <div className="text-3xl sm:text-4xl font-heading font-bold text-dark-50 mb-1 font-mono">{stat.value}</div>
                <div className="text-sm font-semibold text-primary-400 mb-1">{stat.label}</div>
                <div className="text-xs text-dark-400">{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </RevealSection>
      </section>

      {/* ======= PIPELINE SECTION ======= */}
      <section className="py-24 bg-dark-950 relative">
        <div className="absolute top-0 left-0 right-0 gradient-divider" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16">
            <motion.span variants={fadeUp} className="text-sm font-semibold text-primary-400 uppercase tracking-wider">How It Works</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-heading font-semibold text-dark-50 mt-3 mb-4">
              From upload to ranked shortlist
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 max-w-2xl mx-auto">
              Our AI pipeline processes resumes through embedding generation, semantic analysis, and intelligent scoring — all powered by background workers.
            </motion.p>
          </RevealSection>

          <RevealSection className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pipelineSteps.slice(0, 4).map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  variants={fadeUp}
                  className="relative group"
                >
                  <div className="p-6 rounded-2xl bg-dark-800 border border-white/[0.06] h-full transition-all duration-300 hover:border-primary-500/20 hover:shadow-lg hover:shadow-primary-500/5">
                    <div className={`inline-flex p-3 rounded-xl ${step.bg} mb-4`}>
                      <Icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div className="text-xs font-mono text-dark-500 mb-2">Step {i + 1}</div>
                    <h3 className="text-base font-semibold text-dark-50 mb-2">{step.label}</h3>
                    <p className="text-sm text-dark-400 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 text-dark-600">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </RevealSection>

          <RevealSection className="grid sm:grid-cols-3 gap-4 mt-4">
            {pipelineSteps.slice(4).map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  variants={fadeUp}
                  className="relative group"
                >
                  <div className="p-6 rounded-2xl bg-dark-800 border border-white/[0.06] h-full transition-all duration-300 hover:border-primary-500/20 hover:shadow-lg hover:shadow-primary-500/5">
                    <div className={`inline-flex p-3 rounded-xl ${step.bg} mb-4`}>
                      <Icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <div className="text-xs font-mono text-dark-500 mb-2">Step {i + 5}</div>
                    <h3 className="text-base font-semibold text-dark-50 mb-2">{step.label}</h3>
                    <p className="text-sm text-dark-400 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden sm:block absolute top-1/2 -right-2 text-dark-600">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </RevealSection>
        </div>
      </section>

      {/* ======= FEATURES SECTION ======= */}
      <section className="py-24 bg-dark-900 relative">
        <div className="absolute top-0 left-0 right-0 gradient-divider" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16">
            <motion.span variants={fadeUp} className="text-sm font-semibold text-primary-400 uppercase tracking-wider">Features</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-heading font-semibold text-dark-50 mt-3 mb-4">
              Engineered for intelligent hiring
            </motion.h2>
            <motion.p variants={fadeUp} className="text-dark-300 max-w-2xl mx-auto">
              Built on a modern stack — FastAPI, Redis, sentence-transformers, and Gemini — to deliver fast, fair, and accurate resume screening.
            </motion.p>
          </RevealSection>

          <RevealSection className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  className="p-6 rounded-2xl bg-dark-800 border border-white/[0.06] transition-all duration-300 cursor-spotlight hover:border-primary-500/15"
                >
                  <div className="inline-flex p-3 rounded-xl bg-primary-500/10 mb-4">
                    <Icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark-50 mb-2">{feature.title}</h3>
                  <p className="text-sm text-dark-400 leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </RevealSection>
        </div>
      </section>

      {/* ======= TESTIMONIALS SECTION ======= */}
      <section className="py-24 bg-dark-950 relative">
        <div className="absolute top-0 left-0 right-0 gradient-divider" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center mb-16">
            <motion.span variants={fadeUp} className="text-sm font-semibold text-primary-400 uppercase tracking-wider">Testimonials</motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-heading font-semibold text-dark-50 mt-3 mb-4">
              Built for real hiring teams
            </motion.h2>
          </RevealSection>

          <RevealSection className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                className="p-6 rounded-2xl bg-dark-800 border border-white/[0.06]"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-dark-200 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-dark-50">{t.name}</div>
                    <div className="text-xs text-dark-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </RevealSection>
        </div>
      </section>

      {/* ======= CTA SECTION ======= */}
      <section className="py-24 bg-dark-900 relative">
        <div className="absolute top-0 left-0 right-0 gradient-divider" />
        <div className="absolute inset-0 radial-glow-indigo opacity-50" />
        <RevealSection className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-heading font-semibold text-dark-50 mb-4">
            Ready to transform your hiring?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-dark-300 mb-8 max-w-xl mx-auto">
            Join teams that screen smarter, hire faster, and build stronger teams — powered by AI intelligence and engineered for scale.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => navigate('/register')}
              className="shadow-xl shadow-indigo-500/20 text-base"
            >
              Start Screening Today
            </Button>
          </motion.div>
          <motion.p variants={fadeUp} className="mt-6 text-xs text-dark-500">
            No credit card required. Free to start.
          </motion.p>
        </RevealSection>
      </section>
    </div>
  );
};

export default Home;