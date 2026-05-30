// src/components/ui/AIReviewSummary.jsx
import { useState, useEffect } from 'react';
import { summarizeProductReviews } from '../../api/geminiSdkApi';  // ← Changed import

const AIReviewSummary = ({ reviews, productName }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isExpanded && reviews?.length >= 2 && !summary && !loading) {
      fetchSummary();
    }
  }, [isExpanded, reviews]);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await summarizeProductReviews(reviews, productName);
      if (result && (result.pros?.length > 0 || result.cons?.length > 0)) {
        setSummary(result);
      } else {
        setError('Could not generate summary for these reviews');
      }
    } catch (err) {
      console.error('Summary error:', err);
      setError('Failed to analyze reviews');
    } finally {
      setLoading(false);
    }
  };

  // Only show if 2+ reviews
  if (!reviews || reviews.length < 2) {
    return null;
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-2 text-sm font-medium text-copper-600 hover:text-copper-700 transition-colors"
      >
        <span className="text-lg">✨</span>
        {isExpanded ? 'Hide AI Summary' : 'Show AI Summary'}
        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-4 p-5 bg-gradient-to-br from-sapphire-50 to-copper-50 rounded-xl border border-sapphire-100">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-copper-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-ink-600">Analyzing reviews with AI...</span>
            </div>
          ) : error ? (
            <div className="text-sm text-ink-500 text-center py-2">
              <span className="text-amber-500">⚠️</span> {error}
            </div>
          ) : summary ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-copper-600 bg-copper-100 px-2 py-0.5 rounded-full">
                  ✨ AI-Powered Summary
                </span>
                <span className="text-xs text-ink-400">
                  Based on {reviews.length} customer reviews
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Overall Sentiment:</span>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                  summary.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700' :
                  summary.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {summary.sentiment === 'positive' ? '👍 Very Positive' :
                   summary.sentiment === 'negative' ? '👎 Needs Improvement' : '🤔 Mixed Feedback'}
                </span>
              </div>

              {summary.summary && (
                <p className="text-sm text-ink-700 italic leading-relaxed">
                  "{summary.summary}"
                </p>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {summary.pros?.length > 0 && (
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-600 text-lg">✓</span>
                      <span className="text-sm font-semibold text-ink-800">What Customers Love</span>
                    </div>
                    <ul className="space-y-1">
                      {summary.pros.map((pro, idx) => (
                        <li key={idx} className="text-sm text-ink-600 flex items-start gap-2">
                          <span className="text-emerald-500 text-xs mt-0.5">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.cons?.length > 0 && (
                  <div className="bg-white/60 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-600 text-lg">!</span>
                      <span className="text-sm font-semibold text-ink-800">What to Consider</span>
                    </div>
                    <ul className="space-y-1">
                      {summary.cons.map((con, idx) => (
                        <li key={idx} className="text-sm text-ink-600 flex items-start gap-2">
                          <span className="text-amber-500 text-xs mt-0.5">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="text-xs text-ink-400 pt-2 border-t border-sapphire-200">
                ✨ AI-generated insights based on real customer feedback
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AIReviewSummary;