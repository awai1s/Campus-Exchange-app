// src/app/components/CategoryTabs.js
export default function CategoryTabs({ activeCategory, onCategoryChange }) {
  const categories = ['All', 'Textbooks', 'Electronics', 'Furniture'];

  return (
    <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category === 'All' ? '' : category)}
          className={`py-2 px-4 text-sm font-medium ${
            activeCategory === (category === 'All' ? '' : category)
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}