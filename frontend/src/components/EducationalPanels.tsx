import React, { useState } from 'react';
import {
  GraduationCap,
  ChevronDown,
  ChevronUp,
  Binary,
  Layers,
  Scissors,
  Compass,
  Lightbulb,
  Maximize2,
  X
} from 'lucide-react';

interface EducationalPanelsProps {
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const EducationalPanels: React.FC<EducationalPanelsProps> = ({
  isOpenModal = false,
  onCloseModal
}) => {
  const [openCard, setOpenCard] = useState<number | null>(0);

  const concepts = [
    {
      id: 0,
      icon: Layers,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/30',
      title: 'What is an Embedding?',
      subtitle: 'Mapping human language into continuous numerical geometry',
      content: (
        <div className="space-y-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            An <strong>embedding</strong> is a translation of discrete human text (characters, words, or full sentences) into a dense array of real numbers (a vector in continuous space).
          </p>
          <p>
            Computers and neural networks cannot do arithmetic on English letters. Embeddings bridge this gap: the model is trained such that texts with <em>similar semantic meanings</em> end up located close to one another in this high-dimensional coordinate space.
          </p>
          <div className="p-3 rounded-xl bg-navy-950/80 border border-slate-800 font-mono text-xs text-blue-300">
            "The queen reigns" ➔ [ +0.0412, -0.1983, +0.3120, ... (384 numbers) ]
          </div>
        </div>
      )
    },
    {
      id: 1,
      icon: Binary,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/30',
      title: 'What is a Vector?',
      subtitle: 'An ordered list of numbers representing direction & magnitude',
      content: (
        <div className="space-y-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            In linear algebra and computer science, a <strong>vector</strong> is simply an ordered sequence of real numbers: [v₁, v₂, ..., vₙ].
          </p>
          <p>
            In 2D or 3D space, you can think of a vector as an arrow pointing from the origin $(0, 0, 0)$ to a point $(x, y, z)$. In our sentence transformer model, the vector has <strong className="text-indigo-300">384 dimensions</strong>. Each dimension captures an abstract latent feature learned by the transformer attention heads during pretraining on billions of web pages.
          </p>
        </div>
      )
    },
    {
      id: 2,
      icon: Scissors,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
      title: 'What is Tokenization?',
      subtitle: 'Deconstructing text into optimal subword vocabularies',
      content: (
        <div className="space-y-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            <strong>Tokenization</strong> is the very first step in every LLM pipeline. Before calculating vectors, raw text is broken into chunks called <em>tokens</em>.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li>Tokens are not always whole words. Rare words are split into subwords (e.g. <code className="bg-slate-800 px-1 py-0.5 rounded text-white">tokenization</code> becomes <code className="bg-slate-800 px-1 py-0.5 rounded text-white">token</code> + <code className="bg-slate-800 px-1 py-0.5 rounded text-white">##ization</code>).</li>
            <li>Punctuation marks (<code className="bg-slate-800 px-1 py-0.5 rounded text-white">!</code>, <code className="bg-slate-800 px-1 py-0.5 rounded text-white">.</code>, <code className="bg-slate-800 px-1 py-0.5 rounded text-white">?</code>) become their own tokens.</li>
            <li>Special delimiter tokens are added: <code className="bg-slate-800 px-1 py-0.5 rounded text-white">[CLS]</code> marks the beginning of the sequence and <code className="bg-slate-800 px-1 py-0.5 rounded text-white">[SEP]</code> marks boundaries.</li>
          </ul>
        </div>
      )
    },
    {
      id: 3,
      icon: Compass,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
      title: 'What is Cosine Similarity?',
      subtitle: 'Measuring angle rather than magnitude between high-dimensional vectors',
      content: (
        <div className="space-y-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            <strong>Cosine Similarity</strong> calculates the cosine of the angle $\theta$ between two vectors in 384-dimensional space:
          </p>
          <div className="p-2.5 rounded-xl bg-navy-950/80 border border-slate-800 font-mono text-center text-cyan-300 text-xs sm:text-sm">
            Cosine Similarity = ( u • v ) / ( ||u|| * ||v|| ) = cos(θ)
          </div>
          <p>
            Since our vectors are L2-normalized ($||u|| = 1$), cosine similarity equals the dot product.
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400">
            <li><strong>+1.0 (Angle = 0°):</strong> The vectors point in the identical direction (identical semantic meaning).</li>
            <li><strong>0.0 (Angle = 90°):</strong> The vectors are orthogonal / completely unrelated.</li>
            <li><strong>-1.0 (Angle = 180°):</strong> The vectors point in directly opposite directions.</li>
          </ul>
        </div>
      )
    },
    {
      id: 4,
      icon: Lightbulb,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/30',
      title: 'Why Do Similar Sentences Have Similar Embeddings?',
      subtitle: 'Self-attention and contrastive learning in modern transformers',
      content: (
        <div className="space-y-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            Models like <em>all-MiniLM-L6-v2</em> are trained using <strong>Contrastive Learning</strong>. During training, the network is presented with hundreds of millions of pairs of paraphrases and search queries.
          </p>
          <p>
            The loss function mathematically penalizes the model when similar sentences are placed far apart, and rewards it when their vectors align closely. Through multiple multi-head self-attention layers, the model learns deep contextual semantics rather than surface-level keyword matching.
          </p>
        </div>
      )
    },
    {
      id: 5,
      icon: Maximize2,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
      title: 'Why Do We Use PCA for 3D Visualization?',
      subtitle: 'Dimension reduction: preserving maximum variance without losing topology',
      content: (
        <div className="space-y-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
          <p>
            Human vision is limited to 3 spatial dimensions, but our neural vectors exist in <strong>384 dimensions</strong>. We cannot directly draw a 384-D scatter plot.
          </p>
          <p>
            <strong>Principal Component Analysis (PCA)</strong> performs an optimal linear change of basis. It finds the three orthogonal directions (Principal Components 1, 2, and 3) along which the data points vary the most, and projects the cloud onto those 3 axes.
          </p>
          <p className="text-amber-300 text-xs font-semibold">
            Important Note: PCA is an approximation! It captures ~50-70% of the total geometric variance. That is why we compute cosine similarity on the full 384 dimensions.
          </p>
        </div>
      )
    }
  ];

  const contentBody = (
    <div className="space-y-3">
      {concepts.map((concept) => {
        const isOpen = openCard === concept.id;
        const Icon = concept.icon;
        return (
          <div
            key={concept.id}
            className="rounded-2xl border border-slate-800 bg-navy-900/60 overflow-hidden transition-colors"
          >
            <button
              onClick={() => setOpenCard(isOpen ? null : concept.id)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border ${concept.bgColor} ${concept.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-200">
                    {concept.title}
                  </h4>
                  <p className="text-xs text-slate-400 hidden sm:block">
                    {concept.subtitle}
                  </p>
                </div>
              </div>
              <div className="p-1 rounded-lg text-slate-400 hover:text-white">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isOpen && (
              <div className="p-4 pt-1 border-t border-slate-800/60 animate-fade-in">
                {concept.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // If rendered as Modal
  if (isOpenModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-3xl bg-navy-950 border border-slate-800 shadow-2xl overflow-hidden">
          {/* Modal Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-navy-900/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">
                  CS Student Educational Guide to LLM Embeddings
                </h3>
                <p className="text-xs text-slate-400">
                  Core mathematical concepts behind transformer representations
                </p>
              </div>
            </div>
            <button
              onClick={onCloseModal}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-3">
            {contentBody}
          </div>
        </div>
      </div>
    );
  }

  // Rendered as bottom educational section
  return (
    <section className="mt-14 mb-16">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border-indigo-500/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Computer Science Educational Reference
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Fundamental principles of transformer embeddings, token spaces, and vector geometry for students.
            </p>
          </div>
        </div>

        {contentBody}
      </div>
    </section>
  );
};
