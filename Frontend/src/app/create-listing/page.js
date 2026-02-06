// File: src/app/create-listing/page.js
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import Textarea from '../components/Textarea';
import Select from '../components/Select';
import Checkbox from '../components/Checkbox';
import ImageUpload from '../components/ImageUpload';
import { apiFetch } from '@/lib/api';

function formatPKR(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '';
  return `₨ ${x.toLocaleString('en-PK')}`;
}

export default function CreateListing() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    negotiable: false,
  });

  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMsg, setAiMsg] = useState('');
  const [aiErr, setAiErr] = useState('');

  const fileInputRef = useRef(null);

  // ---------- helpers ----------
  const validateForm = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (!formData.description.trim()) e.description = 'Description is required';
    if (!formData.category) e.category = 'Category is required';
    if (!formData.condition) e.condition = 'Condition is required';
    if (!formData.price || Number(formData.price) <= 0) e.price = 'Price must be a positive number';
    if (images.length === 0) e.images = 'At least one image is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((prev) => [...prev, ...newImages]);
    setErrors((prev) => ({ ...prev, images: null }));
  };

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  // ---------- AI price (PKR) ----------
  const fetchAiSuggestion = async () => {
    setAiErr('');
    setAiMsg('');

    // require the 4 fields the model needs
    if (!formData.title || !formData.description || !formData.category || !formData.condition) {
      setAiErr('Please fill Title, Description, Category and Condition first.');
      return;
    }

    setAiLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        condition: formData.condition,
      };

      const data = await apiFetch('/ai/price-suggest', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // accept common property names
      const suggested = Number(
        data?.price ?? data?.suggested_price ?? data?.prediction ?? data?.predicted_price
      );

      if (!Number.isFinite(suggested)) {
        throw new Error('Model did not return a numeric price.');
      }

      setFormData((prev) => ({ ...prev, price: suggested }));
      setAiMsg(`Suggested price: ${formatPKR(suggested)}`);
      setTimeout(() => setAiMsg(''), 6000);
    } catch (err) {
      setAiErr(err?.message || 'Failed to fetch price suggestion.');
      setTimeout(() => setAiErr(''), 6000);
    } finally {
      setAiLoading(false);
    }
  };

  // ---------- submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // require auth
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setSubmitError('Please log in to create a listing.');
      router.push('/auth/login');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('description', formData.description);
      fd.append('price', String(formData.price)); // PKR
      fd.append('category', formData.category);
      fd.append('condition', formData.condition);
      fd.append('negotiable', String(formData.negotiable));
      images.forEach((img) => fd.append('images', img.file));

      const res = await fetch('/api/v1/listings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // don't set Content-Type for FormData
        body: fd,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || `Failed to create listing (${res.status})`);
      }

      const created = await res.json();
      router.push(`/listing/${created.id}`);
    } catch (err) {
      setSubmitError(err.message || 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* bg */}
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900" />
      <motion.div
        className="pointer-events-none absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-white/20 blur-3xl"
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-28 -right-28 w-[32rem] h-[32rem] rounded-full bg-blue-400/25 blur-3xl"
        animate={{ y: [0, -25, 0], x: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-3xl"
      >
        <div className="p-8 rounded-2xl shadow-xl bg-white/80 backdrop-blur-xl border border-white/30 dark:bg-white/10">
          <h1 className="text-4xl font-extrabold text-center text-blue-900 dark:text-white mb-8 tracking-tight">
            Create a New Listing
          </h1>

          {!!submitError && <p className="text-red-500 text-center">{submitError}</p>}
          {!!aiErr && <div className="p-3 mt-3 rounded bg-red-100 text-red-700 text-sm">{aiErr}</div>}
          {!!aiMsg && <div className="p-3 mt-3 rounded bg-green-100 text-green-700 text-sm">{aiMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 dark:text-white">Title</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Calculus Textbook"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 dark:text-white">Description</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your item..."
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 dark:text-white">Category</label>
              <Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Select a category' },
                  { value: 'textbooks', label: 'Textbooks' },
                  { value: 'electronics', label: 'Electronics' },
                  { value: 'furniture', label: 'Furniture' },
                  { value: 'other', label: 'Other' },
                ]}
                className={errors.category ? 'border-red-500' : ''}
              />
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 dark:text-white">Condition</label>
              <Select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                options={[
                  { value: '', label: 'Select condition' },
                  { value: 'new', label: 'New' },
                  { value: 'like-new', label: 'Like New' },
                  { value: 'used', label: 'Used' },
                  { value: 'poor', label: 'Poor' },
                ]}
                className={errors.condition ? 'border-red-500' : ''}
              />
              {errors.condition && <p className="text-red-500 text-sm">{errors.condition}</p>}
            </div>

            {/* Price (at end) + AI */}
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-blue-900 dark:text-white">Price (₨)</label>
                <div className="flex gap-2">
                  <Input
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="e.g., 2999"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={fetchAiSuggestion}
                    disabled={aiLoading}
                  >
                    {aiLoading ? 'Getting…' : 'Get AI Suggestion'}
                  </Button>
                </div>
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
              </div>

              <Checkbox
                name="negotiable"
                checked={formData.negotiable}
                onChange={handleInputChange}
                label="Negotiable"
              />
            </div>

            {/* Images (after price) */}
            <div>
              <label className="block text-sm font-semibold text-blue-900 dark:text-white">Images</label>
              <ImageUpload onChange={handleImageUpload} ref={fileInputRef} multiple accept="image/*" />
              {errors.images && <p className="text-red-500 text-sm">{errors.images}</p>}
              <div className="grid grid-cols-3 gap-4 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.preview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-md shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 justify-end">
              <Button type="submit" variant="primary" disabled={isSubmitting} className="px-6 py-3 text-lg">
                {isSubmitting ? 'Creating…' : 'Create Listing'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.push('/browse')} disabled={isSubmitting} className="px-6 py-3 text-lg">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </motion.div>

      <style jsx>{`
        .animate-gradient { background-size: 300% 300%; animation: gradientShift 18s ease infinite; }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
