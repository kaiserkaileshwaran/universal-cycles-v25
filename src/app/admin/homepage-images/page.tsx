"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Edit2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomepageImagesPage() {
  const { settings, saveSettings, ready } = useStoreSettings();

  const handleUpdateHappyCustomers = (newArr: string[]) => {
    saveSettings({
      ...settings,
      happyCustomersImages: newArr.map(u => u.trim()).filter(Boolean),
    });
  };

  const handleUpdateServices = (newArr: string[]) => {
    saveSettings({
      ...settings,
      serviceAvailableImages: newArr.map(u => u.trim()).filter(Boolean),
    });
  };

  const ImageEditorItem = ({ 
    url, 
    isNew, 
    onUpdate, 
    onDelete 
  }: { 
    url: string; 
    isNew: boolean;
    onUpdate: (val: string) => void;
    onDelete: () => void;
  }) => {
    const [isEditing, setIsEditing] = useState(isNew);
    const [tempUrl, setTempUrl] = useState(url);

    const handleAccept = () => {
      onUpdate(tempUrl);
      setIsEditing(false);
    };

    const handleCancel = () => {
      if (isNew) {
        onDelete();
      } else {
        setTempUrl(url);
        setIsEditing(false);
      }
    };

    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex flex-col sm:flex-row gap-4 bg-card border shadow-sm rounded-xl p-4"
      >
        <div className="shrink-0">
          {(tempUrl || url) && !isEditing ? (
            <div className="w-full sm:w-32 aspect-video bg-muted rounded-lg overflow-hidden border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full sm:w-32 aspect-video bg-muted rounded-lg border flex items-center justify-center text-muted-foreground border-dashed">
              <span className="text-xs">Preview</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          {isEditing ? (
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <LinkIcon size={14} /> Paste Image URL
              </label>
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <input
                  type="url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 min-w-0 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-background"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAccept();
                    }
                  }}
                />
                <button
                  onClick={handleAccept}
                  className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-transparent hover:border-green-200 shrink-0"
                  title="Accept"
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors border border-transparent hover:border-destructive/30 shrink-0"
                  title="Cancel"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2">
                <LinkIcon size={14} /> Link:
              </label>
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <input
                  type="url"
                  value={url}
                  readOnly
                  className="flex-1 min-w-0 px-3 py-2 border rounded-lg bg-muted/30 text-muted-foreground focus:outline-none text-sm truncate cursor-default"
                />
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-transparent hover:border-primary/30 shrink-0"
                  title="Edit Image URL"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors border border-transparent hover:border-destructive/30 shrink-0"
                  title="Delete Image"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const ImageEditorList = ({ 
    title, 
    items, 
    setItems,
    emptyMessage
  }: { 
    title: string, 
    items: string[], 
    setItems: (val: string[]) => void,
    emptyMessage: string
  }) => {
    const [isAddingNew, setIsAddingNew] = useState(false);

    return (
      <div className="bg-muted/10 rounded-2xl p-6 border shadow-sm flex flex-col h-[calc(100vh-180px)] min-h-[500px]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 shrink-0">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex shrink-0 items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add New Image
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 pb-4 flex-1">
          <AnimatePresence initial={false}>
            {isAddingNew && (
              <ImageEditorItem
                key="new-item-input"
                url=""
                isNew={true}
                onUpdate={(newUrl) => {
                  if (newUrl.trim()) {
                    setItems([newUrl, ...items]);
                  }
                  setIsAddingNew(false);
                }}
                onDelete={() => setIsAddingNew(false)}
              />
            )}
            
            {!isAddingNew && items.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-card text-muted-foreground"
              >
                <ImageIcon size={48} className="mb-4 opacity-50" />
                <p>{emptyMessage}</p>
              </motion.div>
            ) : (
              items.map((url, i) => (
                <ImageEditorItem
                  key={`${url}-${i}`}
                  url={url}
                  isNew={false}
                  onUpdate={(newUrl) => {
                    const copy = [...items];
                    copy[i] = newUrl;
                    setItems(copy);
                  }}
                  onDelete={() => {
                    const copy = [...items];
                    copy.splice(i, 1);
                    setItems(copy);
                  }}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  if (!ready) return <AdminLayout><div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="max-w-[1600px] w-full mx-auto space-y-8 pb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Homepage Images</h1>
          <p className="text-muted-foreground text-sm mt-1">Changes you make here are automatically saved and reflect instantly on the live storefront.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <ImageEditorList
            title="Happy Customers"
            items={settings.happyCustomersImages || []}
            setItems={handleUpdateHappyCustomers}
            emptyMessage="No customer photos added yet."
          />

          <ImageEditorList
            title="Services Available"
            items={settings.serviceAvailableImages || []}
            setItems={handleUpdateServices}
            emptyMessage="No service banners added yet."
          />
        </div>
      </div>
    </AdminLayout>
  );
}
