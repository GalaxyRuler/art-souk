import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Calendar, Crown, Star, Sparkles, Palette, Users, TrendingUp, Heart, Globe, Shield, Zap, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const IslamicGeometricPattern = () => (
  <div className="absolute inset-0">
    <div className="absolute top-20 left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-xl animate-pulse" />
    <div className="absolute top-40 right-20 w-48 h-48 bg-blue-500/5 rounded-full blur-xl animate-pulse delay-1000" />
    <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-emerald-500/5 rounded-full blur-xl animate-pulse delay-2000" />
    <div className="absolute bottom-40 right-1/4 w-36 h-36 bg-purple-500/5 rounded-full blur-xl animate-pulse delay-3000" />
    {/* Islamic geometric patterns */}
    <div className="absolute top-1/4 left-1/4 w-24 h-24 border border-amber-500/10 rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
    <div className="absolute bottom-1/4 right-1/4 w-32 h-32 border border-blue-500/10 rotate-12 animate-spin" style={{ animationDuration: '25s' }} />
  </div>
);

const EarlyAccessModal = ({ children }: { children: React.ReactNode }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !userType) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to join the founding member program.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Welcome to Art Souk!",
      description: "You're now on the founding member list. We'll contact you soon with exclusive updates.",
    });
    
    // Reset form
    setEmail('');
    setName('');
    setUserType('');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
            Join Art Souk Founding Members
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          <div>
            <Label htmlFor="userType">I am a...</Label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">Select your role</option>
              <option value="artist">Artist</option>
              <option value="gallery">Gallery Owner</option>
              <option value="collector">Art Collector</option>
              <option value="enthusiast">Art Enthusiast</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold">
            Claim Your Founding Member Spot
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const CompetitiveLandingHero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900">
      {/* Geometric Islamic patterns background */}
      <div className="absolute inset-0 opacity-10">
        <IslamicGeometricPattern />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        {/* Market positioning badge */}
        <div className="inline-flex items-center px-6 py-3 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 font-medium mb-8">
          <Crown className="w-5 h-5 mr-2" />
          The First Comprehensive GCC Art Marketplace
        </div>

        {/* Competitive headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="text-white">Beyond Galleries.</span>
          <br />
          <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Beyond Borders.
          </span>
        </h1>

        {/* Market gap statement */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
          While galleries showcase select artists and craft sites serve artisans, 
          no platform unites the entire GCC art ecosystem. Until now.
        </p>

        {/* Market size proof */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-amber-400">$27M</div>
              <div className="text-sm text-gray-300">Current GCC Market</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">$2.5B</div>
              <div className="text-sm text-gray-300">Projected by 2026</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">6 Countries</div>
              <div className="text-sm text-gray-300">Untapped Markets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">5,000+</div>
              <div className="text-sm text-gray-300">Artists Without Platform</div>
            </div>
          </div>
        </div>

        {/* Launch timeline with urgency */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-red-500/20 border border-red-400/30 rounded-full px-4 py-2 text-red-300 text-sm mb-4">
            Limited Founding Member Spots Available
          </div>
          <p className="text-amber-300 font-semibold">Launching Q2 2025 • Early Access Now Open</p>
        </div>

        {/* Competitive CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <EarlyAccessModal>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold px-8 py-4 text-lg rounded-full transform hover:scale-105 transition-all duration-200"
            >
              Secure Founding Member Spot
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </EarlyAccessModal>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black px-8 py-4 text-lg rounded-full transform hover:scale-105 transition-all duration-200"
            onClick={() => scrollToSection('market-proof')}
          >
            See What We're Building
          </Button>
        </div>
      </div>
    </section>
  );
};

const OpportunityCard = ({ icon, stat, description, source }: { icon: string; stat: string; description: string; source: string }) => (
  <div className="text-center">
    <div className="text-4xl mb-4">{icon}</div>
    <div className="text-3xl font-bold text-slate-900 mb-2">{stat}</div>
    <p className="text-gray-600 mb-2">{description}</p>
    <p className="text-sm text-gray-400">{source}</p>
  </div>
);

const FeatureCard = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="text-center p-4">
    <div className="text-3xl mb-3">{icon}</div>
    <h4 className="font-semibold mb-2">{title}</h4>
    <p className="text-gray-300 text-sm">{description}</p>
  </div>
);

const ComparisonCard = ({ title, subtitle, limitations, advantages, color, isArtSouk }: {
  title: string;
  subtitle: string;
  limitations?: string[];
  advantages?: string[];
  color: string;
  isArtSouk?: boolean;
}) => (
  <div className={`rounded-2xl p-8 ${isArtSouk ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-2 border-amber-400/30' : 'bg-gray-800/50 border border-gray-700'}`}>
    <div className="text-center mb-6">
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <p className={`text-sm ${isArtSouk ? 'text-amber-300' : 'text-gray-400'}`}>{subtitle}</p>
    </div>
    
    <ul className="space-y-3">
      {limitations && limitations.map((limitation, index) => (
        <li key={index} className="flex items-start">
          <XCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-300">{limitation}</span>
        </li>
      ))}
      {advantages && advantages.map((advantage, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-300">{advantage}</span>
        </li>
      ))}
    </ul>
    
    {isArtSouk && (
      <div className="mt-6 text-center">
        <div className="bg-amber-400/20 rounded-full px-4 py-2 text-amber-300 text-sm font-medium">
          Complete Ecosystem
        </div>
      </div>
    )}
  </div>
);

const CompetitiveAdvantageSection = () => {
  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Why Art Souk vs The Rest?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            While others focus on one piece of the puzzle, we're building the complete ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <ComparisonCard
            title="Traditional Galleries"
            subtitle="ATHR, Local Galleries"
            limitations={[
              "Limited to represented artists",
              "Physical location constraints", 
              "High commission fees",
              "Exclusive, not accessible"
            ]}
            color="red"
          />
          
          <ComparisonCard
            title="Craft Marketplaces"
            subtitle="Al Bon, Etsy"
            limitations={[
              "Focus on crafts, not fine art",
              "No gallery partnerships",
              "Limited collector features",
              "No auction capabilities"
            ]}
            color="yellow"
          />
          
          <ComparisonCard
            title="Art Souk"
            subtitle="Complete Ecosystem"
            advantages={[
              "All artists, all mediums",
              "Digital + physical integration",
              "Direct artist-collector connection",
              "Comprehensive GCC coverage"
            ]}
            color="green"
            isArtSouk={true}
          />
        </div>
      </div>
    </section>
  );
};

const FoundingMemberCard = ({ userType, icon, benefits, cta, color }: { 
  userType: string; 
  icon: string; 
  benefits: string[]; 
  cta: string; 
  color: string 
}) => (
  <div className="bg-white rounded-2xl p-8 hover:transform hover:scale-105 transition-all duration-300 shadow-xl">
    <div className="text-center mb-6">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">For {userType}</h3>
      <div className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
        Limited to first 50 members
      </div>
    </div>
    
    <ul className="space-y-3 mb-8">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-start">
          <Star className="w-5 h-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">{benefit}</span>
        </li>
      ))}
    </ul>
    
    <Button className={`w-full ${color === 'amber' ? 'bg-amber-500 hover:bg-amber-600' : color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-emerald-500 hover:bg-emerald-600'} text-white rounded-full py-3`}>
      {cta}
    </Button>
  </div>
);

const FoundingMemberUrgencySection = () => {
  return (
    <section className="py-20 bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-amber-500/20 border border-amber-400/30 rounded-full px-6 py-2 text-amber-300 text-sm font-medium mb-6 inline-block">
          Only 47 Founding Member Spots Remaining
        </div>
        
        <h2 className="text-4xl font-bold text-white mb-6">
          The GCC Art Revolution Starts With 100 Founding Members
        </h2>
        
        <p className="text-xl text-gray-300 mb-8">
          Join the exclusive group that will shape the future of art in Saudi Arabia, UAE, Qatar, Kuwait, Bahrain, and Oman.
        </p>

        {/* Countdown timer */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-700/50">
          <div className="text-sm text-gray-400 mb-2">Early Access Closes In:</div>
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">23</div>
              <div className="text-xs text-gray-400">DAYS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">14</div>
              <div className="text-xs text-gray-400">HOURS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">32</div>
              <div className="text-xs text-gray-400">MINS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">45</div>
              <div className="text-xs text-gray-400">SECS</div>
            </div>
          </div>
        </div>

        <EarlyAccessModal>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold px-12 py-4 text-xl rounded-full transform hover:scale-105 transition-all duration-200"
          >
            Claim Your Founding Member Spot
            <ArrowRight className="ml-2 w-6 h-6" />
          </Button>
        </EarlyAccessModal>
      </div>
    </section>
  );
};

const FeatureListItem = ({ text }: { text: string }) => (
  <li className="flex items-center">
    <Star className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
    <span className="text-gray-700">{text}</span>
  </li>
);

const MarketFactCard = ({ stat, description, source }: { stat: string; description: string; source: string }) => (
  <div className="flex items-start space-x-4">
    <div className="bg-amber-500/20 rounded-full p-3">
      <TrendingUp className="w-6 h-6 text-amber-500" />
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{stat}</div>
      <p className="text-gray-700 mb-1">{description}</p>
      <p className="text-sm text-gray-500">{source}</p>
    </div>
  </div>
);

const VisionListItem = ({ text }: { text: string }) => (
  <li className="flex items-center">
    <CheckCircle className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
    <span className="text-gray-300">{text}</span>
  </li>
);

const MarketProofSection = () => {
  return (
    <section id="market-proof" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              The Market Is Ready. The Technology Is Here.
            </h2>
            
            <div className="space-y-6">
              <MarketFactCard 
                stat="300% Growth"
                description="Saudi art market growth since Vision 2030 launch"
                source="Visual Arts Commission data"
              />
              <MarketFactCard 
                stat="1M+ Visitors"
                description="To UAE art events in 2018 alone"
                source="Louvre Abu Dhabi reports"
              />
              <MarketFactCard 
                stat="$2.5B by 2026"
                description="Projected value of artwork imports/exports"
                source="Late 2023 market projections"
              />
            </div>

            <div className="mt-8 p-6 bg-amber-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2">The Missing Piece</h4>
              <p className="text-gray-700">
                While the market grows and artists flourish, there's no unified platform 
                serving the entire ecosystem. Art Souk bridges this gap.
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">What We're Building</h3>
              <ul className="space-y-3">
                <VisionListItem text="GCC's first comprehensive art marketplace" />
                <VisionListItem text="Direct artist-to-collector connections" />
                <VisionListItem text="Virtual gallery and exhibition tools" />
                <VisionListItem text="Live auction platform" />
                <VisionListItem text="Cultural heritage preservation" />
                <VisionListItem text="Cross-border art discovery" />
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const EarlyAccessSection = () => {
  const { toast } = useToast();
  
  const handleLearnMore = () => {
    toast({
      title: "Coming Soon!",
      description: "More detailed information about Art Souk will be available as we get closer to launch.",
    });
  };

  return (
    <section className="py-20 bg-gradient-to-r from-amber-500 to-yellow-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Join the Art Revolution
        </h2>
        <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
          Be part of the first 100 founding members who will shape the future of GCC art. 
          Your input will directly influence how we build this platform.
        </p>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">50+</div>
              <p className="text-amber-100">Artists Ready</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">25+</div>
              <p className="text-amber-100">Galleries Interested</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">200+</div>
              <p className="text-amber-100">Collectors Waiting</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <EarlyAccessModal>
            <Button 
              size="lg" 
              className="bg-white text-amber-600 hover:bg-amber-50 font-semibold px-8 py-4 text-lg rounded-full transform hover:scale-105 transition-all duration-200"
            >
              <Heart className="mr-2 w-5 h-5" />
              Join Early Access
            </Button>
          </EarlyAccessModal>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-2 border-amber-800 text-amber-800 hover:bg-amber-800 hover:text-white px-8 py-4 text-lg rounded-full transform hover:scale-105 transition-all duration-200"
            onClick={handleLearnMore}
          >
            <Globe className="mr-2 w-5 h-5" />
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Art Souk
            </h3>
            <p className="text-gray-400 mb-4 max-w-md">
              The future of GCC art is here. Join us in creating a platform that celebrates 
              and elevates Middle Eastern artistic heritage.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li>For Artists</li>
              <li>For Galleries</li>
              <li>For Collectors</li>
              <li>Early Access</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>About Us</li>
              <li>Our Mission</li>
              <li>Contact</li>
              <li>Careers</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Art Souk. Built with love for GCC art community.</p>
        </div>
      </div>
    </footer>
  );
};

export default function Landing() {
  return (
    <div className="min-h-screen">
      <CompetitiveLandingHero />
      <CompetitiveAdvantageSection />
      <MarketProofSection />
      <FoundingMemberUrgencySection />
      <EarlyAccessSection />
      <Footer />
    </div>
  );
}