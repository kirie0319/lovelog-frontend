'use client';

import { useState } from 'react';
import { X, Sparkles, Calendar, MapPin, Heart, Clock, DollarSign, Shuffle } from 'lucide-react';

interface AIPlanMakerProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect: (plan: string) => void;
}

interface Plan {
  id: string;
  title: string;
  description: string;
  duration: string;
  budget: string;
  location: string;
  category: 'romantic' | 'adventure' | 'cozy' | 'creative' | 'outdoor';
  emoji: string;
}

const planSuggestions: Plan[] = [
  {
    id: '1',
    title: 'Sunset Picnic Date',
    description: 'Pack your favorite snacks and watch the sunset together at a scenic spot. Bring a cozy blanket and enjoy intimate conversations.',
    duration: '2-3 hours',
    budget: '$20-40',
    location: 'Park or Beach',
    category: 'romantic',
    emoji: '🌅'
  },
  {
    id: '2',
    title: 'Home Cooking Challenge',
    description: 'Pick a cuisine you\'ve never tried before and cook it together. Make it fun with a blindfolded taste test!',
    duration: '2-4 hours',
    budget: '$30-50',
    location: 'Home',
    category: 'cozy',
    emoji: '👨‍🍳'
  },
  {
    id: '3',
    title: 'Stargazing Adventure',
    description: 'Find a dark spot away from city lights, bring hot chocolate in a thermos, and identify constellations together.',
    duration: '3-5 hours',
    budget: '$10-20',
    location: 'Countryside',
    category: 'romantic',
    emoji: '⭐'
  },
  {
    id: '4',
    title: 'Art Gallery & Coffee',
    description: 'Visit a local art gallery or museum, then discuss your favorite pieces over coffee and pastries.',
    duration: '3-4 hours',
    budget: '$40-60',
    location: 'City Center',
    category: 'creative',
    emoji: '🎨'
  },
  {
    id: '5',
    title: 'Hiking & Nature Walk',
    description: 'Explore a nearby trail, take photos of beautiful scenery, and enjoy a packed lunch with a view.',
    duration: '4-6 hours',
    budget: '$15-30',
    location: 'Nature Trail',
    category: 'outdoor',
    emoji: '🥾'
  },
  {
    id: '6',
    title: 'Movie Marathon Night',
    description: 'Create a cozy fort with pillows and blankets, pick a movie series, and make homemade popcorn with different flavors.',
    duration: '4-8 hours',
    budget: '$20-35',
    location: 'Home',
    category: 'cozy',
    emoji: '🍿'
  },
  {
    id: '7',
    title: 'Dance Class Date',
    description: 'Take a beginner\'s dance class together - salsa, swing, or ballroom. Laugh at your mistakes and celebrate small wins!',
    duration: '1-2 hours',
    budget: '$50-80',
    location: 'Dance Studio',
    category: 'adventure',
    emoji: '💃'
  },
  {
    id: '8',
    title: 'Memory Lane Photo Walk',
    description: 'Visit places that are special to your relationship and recreate old photos. Create a new memory book together.',
    duration: '3-5 hours',
    budget: '$25-45',
    location: 'Various',
    category: 'romantic',
    emoji: '📸'
  }
];

const categories = [
  { key: 'all', label: 'All Plans', icon: Sparkles },
  { key: 'romantic', label: 'Romantic', icon: Heart },
  { key: 'cozy', label: 'Cozy', icon: Heart },
  { key: 'adventure', label: 'Adventure', icon: MapPin },
  { key: 'creative', label: 'Creative', icon: Sparkles },
  { key: 'outdoor', label: 'Outdoor', icon: MapPin }
];

export default function AIPlanMaker({ isOpen, onClose, onPlanSelect }: AIPlanMakerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);

  const filteredPlans = selectedCategory === 'all' 
    ? planSuggestions 
    : planSuggestions.filter(plan => plan.category === selectedCategory);

  const getRandomPlan = () => {
    const randomIndex = Math.floor(Math.random() * filteredPlans.length);
    setCurrentPlan(filteredPlans[randomIndex]);
  };

  const handleSendPlan = () => {
    if (currentPlan) {
      const planMessage = `🤖 AI Plan Suggestion: ${currentPlan.emoji} ${currentPlan.title}\n\n${currentPlan.description}\n\n⏰ Duration: ${currentPlan.duration}\n💰 Budget: ${currentPlan.budget}\n📍 Location: ${currentPlan.location}\n\nWhat do you think? 💕`;
      onPlanSelect(planMessage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-lg font-semibold">AI Plan Maker</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="text-gray-800 font-medium">Choose a vibe:</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.key}
                    onClick={() => setSelectedCategory(category.key)}
                    className={`p-3 rounded-lg border-2 transition-all flex items-center space-x-2 ${
                      selectedCategory === category.key
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 text-gray-600'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <button
              onClick={getRandomPlan}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
            >
              <Shuffle className="w-5 h-5" />
              <span>Generate AI Plan</span>
            </button>
          </div>

          {/* Current Plan Display */}
          {currentPlan && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl">{currentPlan.emoji}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{currentPlan.title}</h3>
                  <span className="text-sm text-purple-600 capitalize font-medium">{currentPlan.category}</span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 leading-relaxed">{currentPlan.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <span>{currentPlan.duration}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 text-purple-500" />
                  <span>{currentPlan.budget}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 col-span-2">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  <span>{currentPlan.location}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={getRandomPlan}
                  className="flex-1 px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Try Another
                </button>
                <button
                  onClick={handleSendPlan}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Send to Chat
                </button>
              </div>
            </div>
          )}

          {/* Getting Started Message */}
          {!currentPlan && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered Date Planning</h3>
              <p className="text-gray-600 mb-4">Let AI help you create magical moments together! Choose a vibe and get personalized plan suggestions.</p>
              <div className="text-sm text-gray-500">
                Click "Generate AI Plan" to get started ✨
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 