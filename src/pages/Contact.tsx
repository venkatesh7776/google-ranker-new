import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });

    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      value: 'support@googleranker.com',
      description: 'We reply within 24 hours'
    },
    {
      icon: Phone,
      title: 'WhatsApp',
      value: '+91 95495 17771',
      description: 'Mon-Sat, 9 AM - 7 PM IST'
    },
    {
      icon: MapPin,
      title: 'Office',
      value: 'Bangalore, Karnataka',
      description: 'India'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: 'Mon - Sat',
      description: '9:00 AM - 7:00 PM IST'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <MessageSquare className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-black mb-4">Contact Us</h1>
            <p className="text-xl text-violet-100">
              We'd love to hear from you. Get in touch with our team.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-2 border-violet-200">
                <CardHeader>
                  <CardTitle className="text-2xl">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Your Name</label>
                        <Input
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email Address</label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <Input
                        placeholder="How can we help?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <Textarea
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                    >
                      {isSubmitting ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full border-2 border-slate-200 hover:border-violet-300 transition-colors">
                      <CardContent className="p-6">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mb-4">
                          <info.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-1">{info.title}</h3>
                        <p className="text-violet-600 font-medium">{info.value}</p>
                        <p className="text-slate-500 text-sm">{info.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="h-7 w-7 text-white fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">Quick Support via WhatsApp</h3>
                      <p className="text-slate-600 text-sm mb-3">Get instant responses from our support team</p>
                      <a
                        href="https://wa.me/919549517771"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-green-500 hover:bg-green-600">
                          Chat on WhatsApp
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Link */}
              <Card className="border-2 border-slate-200">
                <CardContent className="p-6 text-center">
                  <h3 className="font-bold text-lg mb-2">Have Questions?</h3>
                  <p className="text-slate-600 mb-4">Check out our frequently asked questions</p>
                  <Link to="/#faq">
                    <Button variant="outline">View FAQs</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500">
            © 2024 Google Ranker. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/privacy-policy" className="hover:text-violet-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-violet-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="/" className="hover:text-violet-400 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
