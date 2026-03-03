import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  FileCheck,
  ArrowRight,
  CheckCircle,
  Users,
  Search,
  Award
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'AI processes resumes in milliseconds, saving you hours of manual screening time.',
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    {
      icon: Shield,
      title: 'Bias Assessment',
      description: 'Objective scoring based on skills and experience to reduce unconscious bias.',
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      icon: TrendingUp,
      title: 'Smart Ranking',
      description: 'Automatically rank candidates by relevance to your specific job requirements.',
      color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    },
    {
      icon: FileCheck,
      title: 'Deep Parsing',
      description: 'Accurately extract skills, experience, and education from any PDF or DOCX.',
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    },
  ];

  const stats = [
    { label: 'Resumes Analyzed', value: '50K+' },
    { label: 'Hours Saved', value: '10k+' },
    { label: 'Accuracy', value: '98%' },
    { label: 'Happy Recruiters', value: '500+' },
  ];

  const steps = [
    {
      icon: FileCheck,
      title: 'Post a Job',
      desc: 'Define your requirements and skills.',
    },
    {
      icon: Users,
      title: 'Candidates Apply',
      desc: 'Applicants upload their resumes easily.',
    },
    {
      icon: Search,
      title: 'AI Screening',
      desc: 'Our engine parses and scores matches.',
    },
    {
      icon: Award,
      title: 'Hire the Best',
      desc: 'Interview, offer, and onboard quickly.',
    },
  ];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-dark-900 transition-colors duration-300">

      {/* --- HERO SECTION --- */}
      <section className="relative pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-28 xl:pt-32 xl:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full bg-primary-100/50 dark:bg-primary-900/10 blur-3xl opacity-60" />
          <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-purple-100/50 dark:bg-purple-900/10 blur-3xl opacity-60" />
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 xl:px-12 relative">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 xl:gap-24 items-center">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-center lg:text-left space-y-6 sm:space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-full shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Next-Gen Hiring Intelligence
                </span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                Hire Smarter, <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
                  Hire Faster.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Stop drowning in resumes. Our AI assistant analyzes, ranks, and shortlists candidates instantly, so you can focus on the people, not the paper.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Button
                  onClick={() => navigate('/register')}
                  size="xl"
                  variant="primary"
                  className="w-full sm:w-auto shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Get Started for Free
                </Button>
                <Button
                  onClick={() => navigate('/how-it-works')}
                  size="xl"
                  variant="outline"
                  className="w-full sm:w-auto bg-white/50 dark:bg-dark-800/50 backdrop-blur-sm"
                >
                  How It Works
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-x-8 text-gray-400 dark:text-gray-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" /> 14-day free trial
                </div>
              </div>
            </motion.div>

            {/* Right Graphics */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 bg-white dark:bg-dark-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-700 p-2 transform rotate-1 transition-transform hover:rotate-0 duration-500">
                <div className="bg-gray-50 dark:bg-dark-900 rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center relative">
                  {/* Abstract UI Mockup */}
                  <div className="absolute inset-x-8 top-8 bottom-0 bg-white dark:bg-dark-800 rounded-t-xl shadow-inner border border-gray-200 dark:border-dark-700 p-6 space-y-4">
                    <div className="flex items-center gap-4 border-b border-gray-100 dark:border-dark-700 pb-4">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-full animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-100 dark:bg-dark-700 rounded w-1/3" />
                        <div className="h-3 bg-gray-50 dark:bg-dark-700 rounded w-1/4" />
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full dark:bg-green-900/30 dark:text-green-400">98% Match</div>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 opacity-60">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-dark-700 rounded-full" />
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-dark-700 rounded" />
                        <div className="w-12 h-2 bg-gray-100 dark:bg-dark-700 rounded" />
                      </div>
                    ))}
                  </div>
                  {/* Floating badge */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute bottom-6 right-6 bg-white dark:bg-dark-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-dark-700 flex items-center gap-3"
                  >
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Efficiency Boost</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">+400%</div>
                    </div>
                  </motion.div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl blur-2xl opacity-20 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50 dark:bg-dark-800/50 border-y border-gray-100 dark:border-dark-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 xl:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-2 sm:mb-3 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-16 sm:py-20 lg:py-28 bg-white dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 xl:px-12">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Why Recruiters Love <span className="text-primary-600">Smart Screener</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              Powerful tools designed to make your hiring process efficient, fair, and effective.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card
                  hover
                  className="h-full border-gray-100 dark:border-dark-700 hover:border-primary-200 dark:hover:border-primary-800/50 transition-colors p-6 sm:p-7 lg:p-8"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-5 sm:mb-6 ${feature.color}`}>
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gray-50 dark:bg-dark-800 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-dark-700 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 xl:px-12">
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              Streamlined for Speed
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              Go from job post to offer letter in record time.
            </p>
          </div>

          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-8">
            {/* Connector Line (Desktop) */}
            <div className="hidden lg:block absolute top-[2.5rem] left-0 right-0 h-0.5 bg-gray-200 dark:bg-dark-700 -z-10" />

            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="text-center group relative"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-white dark:bg-dark-700 rounded-2xl shadow-lg border border-gray-100 dark:border-dark-600 flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-600 dark:bg-primary-900 -z-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-purple-700 dark:from-primary-900 dark:to-dark-950 -z-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />

        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-8 sm:space-y-10"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
              Ready to Hire Your Dream Team?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-primary-100 max-w-2xl mx-auto leading-relaxed">
              Join forward-thinking companies that have switched to data-driven, AI-powered recruitment.
              Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button
                onClick={() => navigate('/register')}
                size="xl"
                className="bg-white text-primary-700 hover:bg-gray-100 border-none shadow-xl w-full sm:w-auto"
              >
                Start Free Trial
              </Button>
              <Button
                onClick={() => navigate('/contact')}
                size="xl"
                variant="outline"
                className="text-white border-white/30 hover:bg-white/10 w-full sm:w-auto"
              >
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;