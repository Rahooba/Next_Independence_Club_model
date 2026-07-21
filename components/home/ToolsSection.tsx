'use client'

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { stripEmoji } from '@/lib/client/utils';
import {
  Timer,
  Layers3,
  PanelsTopLeft,
  Sparkles,
  Users,
  Target,
  BellOff,
  FileText,
  Clock,
  Zap,
  Calendar,
  ArrowLeft,
} from 'lucide-react';

const tools = [
  {
    key: 'model101010',
    icon: Timer,
    link: '/model-10-10-10',
    gradient: 'linear-gradient(135deg, #1E3A5F, #2A5F8F)',
    accent: '#1E3A5F',
    audienceIcon: Users,
    durationIcon: Clock,
    delay: 0,
  },
  {
    key: 'supportLadder',
    icon: Layers3,
    link: '/support-ladder',
    gradient: 'linear-gradient(135deg, #2A9D8F, #21867a)',
    accent: '#2A9D8F',
    audienceIcon: Target,
    durationIcon: Timer,
    delay: 0.1,
  },
  {
    key: 'silentCards',
    icon: PanelsTopLeft,
    link: '/silent-cards',
    gradient: 'linear-gradient(135deg, #E9C46A, #d4a832)',
    accent: '#E9C46A',
    audienceIcon: BellOff,
    durationIcon: Zap,
    delay: 0.2,
  },
  {
    key: 'beautifulMistakes',
    icon: Sparkles,
    link: '/beautiful-mistakes',
    gradient: 'linear-gradient(135deg, #E76F51, #d45a3a)',
    accent: '#E76F51',
    audienceIcon: FileText,
    durationIcon: Calendar,
    delay: 0.3,
  },
];

export default function ToolsSection() {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="tools-v2">
      <div className="tools-v2-inner">
        <motion.div
          className="tools-v2-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="tools-v2-title">{stripEmoji(t('home.section.title'))}</h2>
          <p className="tools-v2-subtitle">{t('home.section.subtitle')}</p>
        </motion.div>

        <div className="tools-v2-grid">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            const AudienceIcon = tool.audienceIcon;
            const DurationIcon = tool.durationIcon;
            const isHovered = hovered === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: tool.delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: '-60px' }}
              >
                <Link href={tool.link} style={{ textDecoration: 'none', display: 'block' }}>
                  <motion.article
                    className="tools-v2-card"
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    whileHover={{ y: -8 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  >
                    {/* Large gradient header with icon */}
                    <div className="tools-v2-card-head" style={{ background: tool.gradient }}>
                      <motion.div
                        className="tools-v2-card-head-icon"
                        animate={isHovered ? { rotate: [0, -8, 8, 0], scale: 1.12 } : { scale: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Icon size={44} strokeWidth={1.4} color="white" />
                      </motion.div>
                      {/* Decorative corner accent */}
                      <div className="tools-v2-card-head-accent" style={{ borderColor: `transparent transparent ${tool.accent}33 transparent` }} />
                    </div>

                    <div className="tools-v2-card-body">
                      <h3 className="tools-v2-card-title">{t(`home.tools.${tool.key}.title` as any)}</h3>
                      <p className="tools-v2-card-subtitle">{t(`home.tools.${tool.key}.subtitle` as any)}</p>
                      <p className="tools-v2-card-desc">{t(`home.tools.${tool.key}.desc` as any)}</p>

                      <div className="tools-v2-card-meta">
                        <div className="tools-v2-card-meta-item">
                          <AudienceIcon size={14} strokeWidth={2} />
                          <span>{stripEmoji(t(`home.tools.${tool.key}.audience` as any))}</span>
                        </div>
                        <div className="tools-v2-card-meta-item">
                          <DurationIcon size={14} strokeWidth={2} />
                          <span>{stripEmoji(t(`home.tools.${tool.key}.duration` as any))}</span>
                        </div>
                      </div>

                      <div className="tools-v2-card-tags">
                        {t(`home.tools.${tool.key}.tags` as any).split(',').map((tag: string, j: number) => (
                          <span key={j} className="tools-v2-card-tag">{tag}</span>
                        ))}
                      </div>

                      <div className="tools-v2-card-cta">
                        <span>{stripEmoji(t('home.tool.cta'))}</span>
                        <motion.span
                          animate={isHovered ? { x: [0, -6, 0] } : {}}
                          transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0 }}
                        >
                          <ArrowLeft size={16} strokeWidth={2.5} />
                        </motion.span>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
