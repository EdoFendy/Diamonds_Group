// components/FeaturesSection.tsx
import React from 'react';
import { Shield, Users, Coins, Zap, Lock, TrendingUp } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { GradientText } from '../layout/GradientText'; // Assicurati che il percorso sia corretto

const features = [
  {
    icon: Shield,
    title: 'Sicurezza Blockchain',
    description: "Tecnologia blockchain all'avanguardia per garantire massima sicurezza e trasparenza."
  },
  {
    icon: Coins,
    title: 'Ricompense Immediate',
    description: 'Sistema di ricompense immediate e ricorrenti basato sul lavoro di squadra.'
  },
  {
    icon: Users,
    title: 'Sistema Meritocratico',
    description: "Distribuzione equa delle risorse basata sul merito e sull'impegno."
  },
  {
    icon: Zap,
    title: 'Velocità Transazioni',
    description: 'Transazioni istantanee con commissioni minime garantite.'
  },
  {
    icon: Lock,
    title: 'Privacy Garantita',
    description: 'I tuoi dati sono protetti con i più alti standard di sicurezza.'
  },
  {
    icon: TrendingUp,
    title: 'Crescita Sostenibile',
    description: 'Modello economico progettato per una crescita a lungo termine.'
  }
];

interface FeatureCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="p-6 bg-black/50 border-yellow-600/20 backdrop-blur-sm transform transition-all duration-300 hover:scale-105">
      <Icon className="w-12 h-12 text-yellow-400 mb-4" />
      <h3 className="text-xl font-semibold mb-2">
        <GradientText>{title}</GradientText>
      </h3>
      <p className="text-gray-300">
        {description}
      </p>
    </Card>
  );
}

export function FeaturesSection() {
  return (
    <section className="relative py-3 bg-gradient-to-b from-black to-neutral-900">
      <div className="container mx-auto px-4">      
        <h2 className="text-4xl font-bold text-center mb-16">
          <GradientText className="bg-clip-text">Caratteristiche Principali</GradientText>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 mt-20">

</div>

    </section>
    
  );
}
