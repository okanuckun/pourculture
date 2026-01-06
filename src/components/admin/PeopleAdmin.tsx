import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Loader2, Users, BookOpen, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface Person {
  id: string;
  name: string;
  title: string;
  bio: string;
  category: string;
  image_url: string | null;
  instagram: string | null;
  twitter: string | null;
  website: string | null;
  is_featured: boolean;
  display_order: number;
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_url: string | null;
  amazon_link: string | null;
  year: number | null;
  is_featured: boolean;
  display_order: number;
}

const emptyPerson: Omit<Person, 'id'> = {
  name: '',
  title: '',
  bio: '',
  category: 'winemaker',
  image_url: null,
  instagram: null,
  twitter: null,
  website: null,
  is_featured: true,
  display_order: 0,
};

const emptyBook: Omit<Book, 'id'> = {
  title: '',
  author: '',
  description: '',
  cover_url: null,
  amazon_link: null,
  year: null,
  is_featured: true,
  display_order: 0,
};

export const PeopleAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('people');
  const [people, setPeople] = useState<Person[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isCreatingPerson, setIsCreatingPerson] = useState(false);
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [newPerson, setNewPerson] = useState<Omit<Person, 'id'>>(emptyPerson);
  const [newBook, setNewBook] = useState<Omit<Book, 'id'>>(emptyBook);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [peopleResult, booksResult] = await Promise.all([
      supabase.from('featured_people').select('*').order('display_order'),
      supabase.from('recommended_books').select('*').order('display_order'),
    ]);

    if (peopleResult.data) setPeople(peopleResult.data);
    if (booksResult.data) setBooks(booksResult.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Person CRUD
  const handleCreatePerson = async () => {
    setSaving(true);
    const { error } = await supabase.from('featured_people').insert([newPerson]);
    if (error) {
      toast.error('Failed to create person');
    } else {
      toast.success('Person created successfully');
      setIsCreatingPerson(false);
      setNewPerson(emptyPerson);
      fetchData();
    }
    setSaving(false);
  };

  const handleUpdatePerson = async () => {
    if (!editingPerson) return;
    setSaving(true);
    const { error } = await supabase
      .from('featured_people')
      .update(editingPerson)
      .eq('id', editingPerson.id);
    if (error) {
      toast.error('Failed to update person');
    } else {
      toast.success('Person updated successfully');
      setEditingPerson(null);
      fetchData();
    }
    setSaving(false);
  };

  const handleDeletePerson = async (id: string) => {
    if (!confirm('Are you sure you want to delete this person?')) return;
    const { error } = await supabase.from('featured_people').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete person');
    } else {
      toast.success('Person deleted');
      fetchData();
    }
  };

  // Book CRUD
  const handleCreateBook = async () => {
    setSaving(true);
    const { error } = await supabase.from('recommended_books').insert([newBook]);
    if (error) {
      toast.error('Failed to create book');
    } else {
      toast.success('Book created successfully');
      setIsCreatingBook(false);
      setNewBook(emptyBook);
      fetchData();
    }
    setSaving(false);
  };

  const handleUpdateBook = async () => {
    if (!editingBook) return;
    setSaving(true);
    const { error } = await supabase
      .from('recommended_books')
      .update(editingBook)
      .eq('id', editingBook.id);
    if (error) {
      toast.error('Failed to update book');
    } else {
      toast.success('Book updated successfully');
      setEditingBook(null);
      fetchData();
    }
    setSaving(false);
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    const { error } = await supabase.from('recommended_books').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete book');
    } else {
      toast.success('Book deleted');
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted">
          <TabsTrigger value="people" className="gap-2">
            <Users className="w-4 h-4" />
            People ({people.length})
          </TabsTrigger>
          <TabsTrigger value="books" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Books ({books.length})
          </TabsTrigger>
        </TabsList>

        {/* People Tab */}
        <TabsContent value="people" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Featured People</h3>
            <Button onClick={() => setIsCreatingPerson(true)} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Person
            </Button>
          </div>

          {/* Create Person Form */}
          {isCreatingPerson && (
            <div className="border-2 border-foreground p-4 space-y-4">
              <h4 className="font-semibold">New Person</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={newPerson.name}
                    onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={newPerson.title}
                    onChange={(e) => setNewPerson({ ...newPerson, title: e.target.value })}
                    placeholder="e.g., Winemaker, Sommelier"
                  />
                </div>
                <div>
                  <Label>Category *</Label>
                  <Select
                    value={newPerson.category}
                    onValueChange={(v) => setNewPerson({ ...newPerson, category: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="winemaker">Winemaker</SelectItem>
                      <SelectItem value="sommelier">Sommelier</SelectItem>
                      <SelectItem value="writer">Writer</SelectItem>
                      <SelectItem value="influencer">Influencer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={newPerson.display_order}
                    onChange={(e) => setNewPerson({ ...newPerson, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label>Bio *</Label>
                <Textarea
                  value={newPerson.bio}
                  onChange={(e) => setNewPerson({ ...newPerson, bio: e.target.value })}
                  placeholder="Short biography"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Instagram</Label>
                  <Input
                    value={newPerson.instagram || ''}
                    onChange={(e) => setNewPerson({ ...newPerson, instagram: e.target.value || null })}
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label>Twitter</Label>
                  <Input
                    value={newPerson.twitter || ''}
                    onChange={(e) => setNewPerson({ ...newPerson, twitter: e.target.value || null })}
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={newPerson.website || ''}
                    onChange={(e) => setNewPerson({ ...newPerson, website: e.target.value || null })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={newPerson.image_url || ''}
                  onChange={(e) => setNewPerson({ ...newPerson, image_url: e.target.value || null })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newPerson.is_featured}
                  onCheckedChange={(v) => setNewPerson({ ...newPerson, is_featured: v })}
                />
                <Label>Featured (visible on site)</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePerson} disabled={saving || !newPerson.name || !newPerson.title || !newPerson.bio}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save
                </Button>
                <Button variant="outline" onClick={() => { setIsCreatingPerson(false); setNewPerson(emptyPerson); }}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* People List */}
          <div className="space-y-2">
            {people.map((person) => (
              <div key={person.id} className="border border-foreground/20 p-3 flex items-center justify-between">
                {editingPerson?.id === person.id ? (
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={editingPerson.name}
                        onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                        placeholder="Name"
                      />
                      <Input
                        value={editingPerson.title}
                        onChange={(e) => setEditingPerson({ ...editingPerson, title: e.target.value })}
                        placeholder="Title"
                      />
                      <Select
                        value={editingPerson.category}
                        onValueChange={(v) => setEditingPerson({ ...editingPerson, category: v })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="winemaker">Winemaker</SelectItem>
                          <SelectItem value="sommelier">Sommelier</SelectItem>
                          <SelectItem value="writer">Writer</SelectItem>
                          <SelectItem value="influencer">Influencer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      value={editingPerson.bio}
                      onChange={(e) => setEditingPerson({ ...editingPerson, bio: e.target.value })}
                      rows={2}
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editingPerson.is_featured}
                          onCheckedChange={(v) => setEditingPerson({ ...editingPerson, is_featured: v })}
                        />
                        <Label className="text-xs">Featured</Label>
                      </div>
                      <Input
                        type="number"
                        className="w-20"
                        value={editingPerson.display_order}
                        onChange={(e) => setEditingPerson({ ...editingPerson, display_order: parseInt(e.target.value) || 0 })}
                        placeholder="Order"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdatePerson} disabled={saving}>
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingPerson(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${person.is_featured ? 'bg-green-500' : 'bg-muted'}`} />
                      <div>
                        <div className="font-medium text-sm">{person.name}</div>
                        <div className="text-xs text-muted-foreground">{person.title} • {person.category}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingPerson(person)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeletePerson(person.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Books Tab */}
        <TabsContent value="books" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recommended Books</h3>
            <Button onClick={() => setIsCreatingBook(true)} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Book
            </Button>
          </div>

          {/* Create Book Form */}
          {isCreatingBook && (
            <div className="border-2 border-foreground p-4 space-y-4">
              <h4 className="font-semibold">New Book</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    placeholder="Book title"
                  />
                </div>
                <div>
                  <Label>Author *</Label>
                  <Input
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={newBook.year || ''}
                    onChange={(e) => setNewBook({ ...newBook, year: parseInt(e.target.value) || null })}
                    placeholder="2024"
                  />
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={newBook.display_order}
                    onChange={(e) => setNewBook({ ...newBook, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  placeholder="Book description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cover URL</Label>
                  <Input
                    value={newBook.cover_url || ''}
                    onChange={(e) => setNewBook({ ...newBook, cover_url: e.target.value || null })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Amazon Link</Label>
                  <Input
                    value={newBook.amazon_link || ''}
                    onChange={(e) => setNewBook({ ...newBook, amazon_link: e.target.value || null })}
                    placeholder="https://amazon.com/..."
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newBook.is_featured}
                  onCheckedChange={(v) => setNewBook({ ...newBook, is_featured: v })}
                />
                <Label>Featured (visible on site)</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateBook} disabled={saving || !newBook.title || !newBook.author || !newBook.description}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save
                </Button>
                <Button variant="outline" onClick={() => { setIsCreatingBook(false); setNewBook(emptyBook); }}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Books List */}
          <div className="space-y-2">
            {books.map((book) => (
              <div key={book.id} className="border border-foreground/20 p-3 flex items-center justify-between">
                {editingBook?.id === book.id ? (
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={editingBook.title}
                        onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                        placeholder="Title"
                      />
                      <Input
                        value={editingBook.author}
                        onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                        placeholder="Author"
                      />
                      <Input
                        type="number"
                        value={editingBook.year || ''}
                        onChange={(e) => setEditingBook({ ...editingBook, year: parseInt(e.target.value) || null })}
                        placeholder="Year"
                      />
                    </div>
                    <Textarea
                      value={editingBook.description}
                      onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                      rows={2}
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editingBook.is_featured}
                          onCheckedChange={(v) => setEditingBook({ ...editingBook, is_featured: v })}
                        />
                        <Label className="text-xs">Featured</Label>
                      </div>
                      <Input
                        type="number"
                        className="w-20"
                        value={editingBook.display_order}
                        onChange={(e) => setEditingBook({ ...editingBook, display_order: parseInt(e.target.value) || 0 })}
                        placeholder="Order"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdateBook} disabled={saving}>
                        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingBook(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${book.is_featured ? 'bg-green-500' : 'bg-muted'}`} />
                      <div>
                        <div className="font-medium text-sm">{book.title}</div>
                        <div className="text-xs text-muted-foreground">by {book.author} {book.year && `(${book.year})`}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingBook(book)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteBook(book.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
