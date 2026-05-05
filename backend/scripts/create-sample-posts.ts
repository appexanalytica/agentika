import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../src/config/database';
import BlogPost from '../src/models/BlogPost';
import User from '../src/models/User';

// Load environment variables
dotenv.config();

// Sample blog posts data
const samplePosts = [
  {
    title: "Introducción a la Sostenibilidad Urbana",
    slug: "introduccion-a-la-sostenibilidad-urbana",
    content: "# Introducción a la Sostenibilidad Urbana\n\nLa sostenibilidad urbana es un concepto fundamental en el desarrollo de ciudades modernas. Implica crear entornos urbanos que sean económicamente viables, socialmente equitativos y ambientalmente responsables.\n\n## ¿Qué es la sostenibilidad urbana?\n\nLa sostenibilidad urbana se enfoca en:\n\n- Reducción de la huella ecológica\n- Mejora de la calidad de vida\n- Eficiencia en el uso de recursos\n- Promoción de la equidad social\n\n## Beneficios\n\n- Mejora de la salud pública\n- Reducción de costos operativos\n- Incremento de la productividad\n- Mayor atracción de talento",
    excerpt: "La sostenibilidad urbana es fundamental para el desarrollo de ciudades modernas. Descubre cómo crear entornos urbanos sostenibles.",
    category: "SUSTAINABILITY",
    tags: ["sostenibilidad", "ciudades", "medio ambiente"],
    status: "published",
    seoTitle: "Sostenibilidad Urbana - Guía Completa",
    seoDescription: "Aprende sobre sostenibilidad urbana y cómo aplicarla en el desarrollo de ciudades modernas.",
    readTime: "5 min read"
  },
  {
    title: "Diseño de Espacios Públicos Sostenibles",
    slug: "diseno-de-espacios-publicos-sostenibles",
    content: "# Diseño de Espacios Públicos Sostenibles\n\nLos espacios públicos son fundamentales para la vida urbana. Un buen diseño sostenible puede mejorar significativamente la calidad de vida de los ciudadanos.\n\n## Principios del diseño sostenible\n\n- Uso de materiales locales y reciclados\n- Integración de vegetación nativa\n- Eficiencia energética en iluminación\n- Accesibilidad universal\n\n## Ejemplos prácticos\n\n- Parques con sistemas de riego por lluvia\n- Mobiliario urbano hecho de materiales reciclados\n- Áreas de recreación con energía solar\n\n## Impacto positivo\n\n- Reducción de emisiones de carbono\n- Mejora de la salud mental\n- Fomento de la interacción social",
    excerpt: "Descubre cómo diseñar espacios públicos que sean sostenibles y beneficiosos para la comunidad.",
    category: "DESIGN",
    tags: ["diseño", "espacios públicos", "sostenibilidad"],
    status: "published",
    seoTitle: "Diseño Sostenible de Espacios Públicos",
    seoDescription: "Guía completa sobre cómo diseñar espacios públicos sostenibles para ciudades modernas.",
    readTime: "7 min read"
  },
  {
    title: "Planificación Urbana Inteligente",
    slug: "planificacion-urbana-inteligente",
    content: "# Planificación Urbana Inteligente\n\nLa planificación urbana inteligente utiliza tecnología avanzada para optimizar el desarrollo de ciudades.\n\n## Tecnologías clave\n\n- IoT (Internet de las Cosas)\n- Big Data y análisis predictivo\n- Sistemas de gestión de tráfico\n- Gestión de recursos energéticos\n\n## Beneficios\n\n- Optimización del uso del espacio\n- Mejora de servicios públicos\n- Reducción de congestión\n- Mayor eficiencia energética\n\n## Casos de éxito\n\n- Ciudades con sistemas de transporte automatizados\n- Zonas residenciales con gestión energética inteligente\n- Infraestructuras con monitoreo en tiempo real",
    excerpt: "Explora cómo la tecnología está transformando la planificación urbana tradicional.",
    category: "URBAN PLANNING",
    tags: ["planificación", "tecnología", "ciudades inteligentes"],
    status: "published",
    seoTitle: "Planificación Urbana Inteligente",
    seoDescription: "Cómo la tecnología está revolucionando la planificación urbana moderna.",
    readTime: "6 min read"
  }
];

const createSamplePosts = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Get the admin user
    const adminUser = await User.findOne({ email: 'admin@agentika.com' });
    if (!adminUser) {
      console.error('Admin user not found!');
      process.exit(1);
    }
    
    console.log('Found admin user:', adminUser.email);
    
    // Clear existing posts
    await BlogPost.deleteMany({});
    console.log('Cleared existing blog posts');
    
    // Create sample posts with admin user as author
    const postsWithAuthor = samplePosts.map(post => ({
      ...post,
      author: adminUser._id
    }));
    
    const createdPosts = await BlogPost.insertMany(postsWithAuthor);
    console.log(`Created ${createdPosts.length} sample blog posts`);
    
    // Print created posts
    createdPosts.forEach(post => {
      console.log(`- ${post.title} (${post.slug})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample posts:', error);
    process.exit(1);
  }
};

createSamplePosts();