import React from 'react';
import PublicLayout from '../../components/layout/PublicLayout';
import SEOHead from '../../components/ui/SEOHead';

const About = () => {
  return (
    <PublicLayout>
      <SEOHead title="About Us" description="Learn more about the Lumina team and our mission." />
      
      {/* Hero */}
      <div className="bg-[#020617] py-20 relative overflow-hidden">
         <div className="absolute inset-0 bg-brand-blue/5"></div>
         <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-blue/10 to-transparent"></div>
         <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
           <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">About Lumina</h1>
           <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
             We are a collective of digital explorers, data analysts, and storytellers dedicated to illuminating the path forward in the digital age.
           </p>
         </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="prose prose-lg prose-slate dark:prose-invert mx-auto">
          <p className="lead text-2xl text-primary font-serif leading-relaxed">
            Founded in 2024, Lumina started as a small internal project to document SEO experiments. Today, it has grown into a premier destination for marketing insights.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 my-16">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-2xl border border-blue-100 dark:border-blue-900/20">
               <h3 className="text-brand-blue font-bold text-xl mb-4 mt-0">Our Mission</h3>
               <p className="mb-0 text-secondary">
                 To demystify the complexities of modern digital marketing and provide actionable, data-backed strategies for businesses of all sizes.
               </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
               <h3 className="text-emerald-600 dark:text-emerald-400 font-bold text-xl mb-4 mt-0">Our Vision</h3>
               <p className="mb-0 text-secondary">
                 A web where quality content reigns supreme, and businesses grow by providing genuine value to their audience.
               </p>
            </div>
          </div>

          <h2>The Team</h2>
          <p>
            Our contributors come from diverse backgrounds—from technical SEOs and software engineers to creative writers and brand strategists. We believe that the best insights come from the intersection of data and creativity.
          </p>
          <p>
            We are constantly experimenting with new technologies (like AI and automation) to understand how they reshape the landscape of digital consumption.
          </p>

          <hr className="my-12 border-slate-200 dark:border-slate-800" />

          <h2>Join the Conversation</h2>
          <p>
            Have a topic you want us to cover? Or perhaps you have a unique case study to share? We are always looking for new perspectives.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default About;