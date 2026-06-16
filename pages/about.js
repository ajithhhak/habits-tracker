import Layout from '../components/Layout'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/useAuth'
import { Loader2, User, Circle, Hexagon, Triangle, Square } from 'lucide-react'

export default function About() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
          <Loader2 className="animate-spin mb-4 text-violet-500" size={32} />
          <p className="font-medium animate-pulse font-mono">Loading Profile...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout user={user}>
      <div className="bg-white min-h-full rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden text-slate-900 font-sans pb-16">
        
        {/* Header matching the design */}
        <div className="flex justify-between items-center p-8 border-b border-slate-100">
           <div className="font-bold text-xl flex items-center gap-2">
             <div className="w-5 h-5 bg-slate-900 rounded-sm"></div>
             Hyper.
           </div>
           <div className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
             <span className="text-slate-900 cursor-pointer">About Us</span>
             <span className="hover:text-slate-900 cursor-pointer transition-colors">Project</span>
             <span className="hover:text-slate-900 cursor-pointer transition-colors">Blog</span>
             <span className="hover:text-slate-900 cursor-pointer transition-colors">Contact us</span>
           </div>
           <div className="text-sm font-medium border-b border-slate-900 pb-0.5 cursor-pointer hidden sm:block">
             hello@myfolio.com
           </div>
        </div>

        <div className="px-8 py-12 md:py-20 lg:px-16 max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
              >
                I'm a creative<br/>VLSI engineer<br/>& developer
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-slate-500 text-lg mb-8 max-w-md leading-relaxed"
              >
                A <span className="text-slate-900 font-semibold">Hardware Developer</span> and <span className="text-slate-900 font-semibold">Electronics Engineer</span>. I specialize in VLSI Design, Embedded Systems, and AI Integration.
              </motion.p>
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-full font-bold tracking-wider text-xs transition-all shadow-lg shadow-violet-200"
              >
                CONNECT WITH ME
              </motion.button>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative h-[400px] md:h-[600px] bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 group"
            >
              {/* Placeholder for user photo */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:bg-slate-100 transition-colors">
                 {user?.avatar ? (
                   <img src={user.avatar} alt="Profile" className="w-full h-full object-cover grayscale opacity-90" />
                 ) : (
                   <>
                     <User size={64} className="mb-4 opacity-50" />
                     <p className="font-medium text-sm text-slate-500">Photo placeholder</p>
                     <p className="text-xs opacity-70 mt-1">Will be updated shortly</p>
                   </>
                 )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Trusted By Section */}
        <div className="border-y border-slate-100 py-12 px-8 lg:px-16 bg-slate-50/50">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="text-xs font-bold text-slate-400 tracking-widest max-w-[150px] leading-relaxed uppercase shrink-0">
              Trusted by high-growth startups and investors
            </div>
            <div className="flex-1 flex flex-wrap justify-between items-center gap-8 text-slate-400 w-full opacity-60 grayscale">
              <div className="flex items-center gap-2 font-bold text-xl"><Circle size={24}/> Snowflake</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Hexagon size={24}/> Proline</div>
              <div className="flex items-center gap-2 font-bold text-xl h-6 font-serif">h Hitech</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Triangle size={24}/> Flash</div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="px-8 py-16 md:py-24 lg:px-16 max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-16">Service I provide</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Phone Mockup Placeholder */}
            <div className="bg-slate-50 rounded-3xl h-[500px] md:h-[600px] flex items-center justify-center relative overflow-hidden border border-slate-100">
               <div className="w-[260px] md:w-[280px] h-[540px] md:h-[580px] bg-white rounded-[40px] shadow-2xl border-[8px] border-slate-800 p-4 flex flex-col gap-4 relative mt-20 md:mt-32 transition-transform hover:-translate-y-4 duration-500">
                  <div className="w-20 h-6 bg-slate-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl"></div>
                  <div className="w-full h-32 bg-slate-100 rounded-xl mt-4 flex items-center justify-center text-slate-300 font-medium text-sm">EVANO<br/>Everyday</div>
                  <div className="flex gap-2 h-24">
                     <div className="w-1/2 bg-slate-200 rounded-lg"></div>
                     <div className="w-1/2 bg-slate-100 rounded-lg"></div>
                  </div>
                  <div className="w-full flex-1 bg-slate-50 rounded-xl"></div>
               </div>
            </div>

            {/* Services List */}
            <div className="flex flex-col justify-center gap-12 relative py-8">
               <div className="absolute left-0 top-8 bottom-8 w-[2px] bg-slate-100 hidden lg:block"></div>
               
               <div className="relative lg:pl-12">
                 <div className="hidden lg:block absolute left-[-5px] top-2 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white"></div>
                 <h3 className="text-2xl md:text-3xl font-bold mb-4">Hardware Engineering</h3>
                 <p className="text-slate-500 mb-8 text-sm leading-relaxed max-w-md">
                   Building reliable and efficient hardware systems from the ground up, focusing on optimal performance and design.
                 </p>
                 <ul className="space-y-4">
                   <li className="flex items-center gap-4 text-sm font-semibold">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                     VLSI Design
                   </li>
                   <li className="flex items-center gap-4 text-sm font-semibold">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                     Embedded Systems
                   </li>
                   <li className="flex items-center gap-4 text-sm font-semibold">
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                     IoT Protocols
                   </li>
                 </ul>
               </div>

               <div className="w-full h-[1px] bg-slate-100 lg:ml-12 max-w-md"></div>

               <div className="relative lg:pl-12 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                 <h3 className="text-2xl md:text-3xl font-bold mb-2">Software & AI</h3>
               </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}
