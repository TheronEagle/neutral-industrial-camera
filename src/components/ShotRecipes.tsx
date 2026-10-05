import { SHOT_RECIPES } from '@aesthetic/spec';

export const ShotRecipesScreen = () => {
  return (
    <div className="min-h-screen bg-charcoal-black p-4">
      <h1 className="text-fog-white text-xl mb-4">SHOT RECIPES</h1>
      <div className="space-y-3">
        {SHOT_RECIPES.map(recipe => (
          <div key={recipe.id} className="bg-graphite-grey p-4 rounded">
            <div className="text-fog-white font-medium mb-2">{recipe.name}</div>
            <div className="text-concrete-grey text-xs space-y-1">
              <div>Lighting: {recipe.lighting}</div>
              <div>Background: {recipe.background}</div>
              <div>Edit: {recipe.editPreset}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
