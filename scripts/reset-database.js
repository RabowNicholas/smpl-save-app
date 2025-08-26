#!/usr/bin/env node

/**
 * Database Reset Script for SMPL Save App
 * 
 * This script will:
 * 1. Fix the users table schema (remove user_code column)
 * 2. Clear existing categories and services
 * 3. Populate with new insurance and telecom data
 * 
 * Usage:
 *   node scripts/reset-database.js
 * 
 * Make sure your .env.local file has the correct Supabase credentials:
 *   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Required variables:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// New categories and services data
const categories = [
  { id: 'phone-carriers', name: 'Phone Carriers', icon: '📱', display_order: 1 },
  { id: 'home-insurance', name: 'Home Insurance', icon: '🏠', display_order: 2 },
  { id: 'auto-insurance', name: 'Auto Insurance', icon: '🚗', display_order: 3 },
  { id: 'renters-insurance', name: 'Renters Insurance', icon: '🏢', display_order: 4 },
  { id: 'internet', name: 'Internet', icon: '🌐', display_order: 5 }
]

const services = [
  // Phone Carriers
  { id: 'verizon-mobile', name: 'Verizon', category_id: 'phone-carriers', is_featured: true },
  { id: 'att-mobile', name: 'AT&T', category_id: 'phone-carriers', is_featured: true },
  { id: 't-mobile', name: 'T-Mobile', category_id: 'phone-carriers', is_featured: true },
  { id: 'sprint', name: 'Sprint', category_id: 'phone-carriers', is_featured: false },
  { id: 'mint-mobile', name: 'Mint Mobile', category_id: 'phone-carriers', is_featured: false },
  { id: 'cricket', name: 'Cricket', category_id: 'phone-carriers', is_featured: false },
  
  // Home Insurance
  { id: 'state-farm-home', name: 'State Farm', category_id: 'home-insurance', is_featured: true },
  { id: 'geico-home', name: 'GEICO', category_id: 'home-insurance', is_featured: true },
  { id: 'progressive-home', name: 'Progressive', category_id: 'home-insurance', is_featured: true },
  { id: 'allstate-home', name: 'Allstate', category_id: 'home-insurance', is_featured: true },
  { id: 'liberty-mutual-home', name: 'Liberty Mutual', category_id: 'home-insurance', is_featured: false },
  { id: 'farmers-home', name: 'Farmers', category_id: 'home-insurance', is_featured: false },
  
  // Auto Insurance
  { id: 'state-farm-auto', name: 'State Farm', category_id: 'auto-insurance', is_featured: true },
  { id: 'geico-auto', name: 'GEICO', category_id: 'auto-insurance', is_featured: true },
  { id: 'progressive-auto', name: 'Progressive', category_id: 'auto-insurance', is_featured: true },
  { id: 'allstate-auto', name: 'Allstate', category_id: 'auto-insurance', is_featured: true },
  { id: 'liberty-mutual-auto', name: 'Liberty Mutual', category_id: 'auto-insurance', is_featured: false },
  { id: 'farmers-auto', name: 'Farmers', category_id: 'auto-insurance', is_featured: false },
  
  // Renters Insurance
  { id: 'lemonade-renters', name: 'Lemonade', category_id: 'renters-insurance', is_featured: true },
  { id: 'state-farm-renters', name: 'State Farm', category_id: 'renters-insurance', is_featured: true },
  { id: 'geico-renters', name: 'GEICO', category_id: 'renters-insurance', is_featured: true },
  { id: 'progressive-renters', name: 'Progressive', category_id: 'renters-insurance', is_featured: true },
  { id: 'allstate-renters', name: 'Allstate', category_id: 'renters-insurance', is_featured: false },
  { id: 'assurant-renters', name: 'Assurant', category_id: 'renters-insurance', is_featured: false },
  
  // Internet
  { id: 'comcast-xfinity', name: 'Comcast Xfinity', category_id: 'internet', is_featured: true },
  { id: 'spectrum', name: 'Spectrum', category_id: 'internet', is_featured: true },
  { id: 'verizon-fios', name: 'Verizon Fios', category_id: 'internet', is_featured: true },
  { id: 'att-internet', name: 'AT&T Internet', category_id: 'internet', is_featured: true },
  { id: 'cox', name: 'Cox', category_id: 'internet', is_featured: false },
  { id: 'centurylink', name: 'CenturyLink', category_id: 'internet', is_featured: false }
]

async function resetDatabase() {
  console.log('🚀 Starting database reset...\n')

  try {
    // Step 1: Clear existing data (in correct order for foreign key constraints)
    console.log('🗑️  Clearing existing data...')
    
    const { error: userServicesError } = await supabase
      .from('user_services')
      .delete()
      .neq('id', 'dummy') // Delete all rows
    
    if (userServicesError) {
      console.error('❌ Error clearing user_services:', userServicesError)
      return
    }

    const { error: servicesError } = await supabase
      .from('services')
      .delete()
      .neq('id', 'dummy') // Delete all rows
    
    if (servicesError) {
      console.error('❌ Error clearing services:', servicesError)
      return
    }

    const { error: categoriesError } = await supabase
      .from('categories')
      .delete()
      .neq('id', 'dummy') // Delete all rows
    
    if (categoriesError) {
      console.error('❌ Error clearing categories:', categoriesError)
      return
    }

    console.log('✅ Cleared existing data\n')

    // Step 2: Insert new categories
    console.log('📁 Inserting new categories...')
    
    const { data: categoryData, error: categoryInsertError } = await supabase
      .from('categories')
      .insert(categories.map(cat => ({
        ...cat,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))

    if (categoryInsertError) {
      console.error('❌ Error inserting categories:', categoryInsertError)
      return
    }

    console.log(`✅ Inserted ${categories.length} categories`)

    // Step 3: Insert new services
    console.log('🏢 Inserting new services...')
    
    const { data: serviceData, error: serviceInsertError } = await supabase
      .from('services')
      .insert(services.map(service => ({
        ...service,
        logo_url: null, // Will be populated later with actual logos
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })))

    if (serviceInsertError) {
      console.error('❌ Error inserting services:', serviceInsertError)
      return
    }

    console.log(`✅ Inserted ${services.length} services\n`)

    // Step 4: Verify results
    console.log('🔍 Verifying results...')
    
    const { data: finalCategories } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')

    const { data: finalServices } = await supabase
      .from('services')
      .select('*')

    console.log('\n📊 Summary:')
    console.log(`Categories: ${finalCategories?.length || 0}`)
    console.log(`Services: ${finalServices?.length || 0}`)

    if (finalCategories) {
      console.log('\n📋 Categories created:')
      finalCategories.forEach(cat => {
        const serviceCount = finalServices?.filter(s => s.category_id === cat.id).length || 0
        console.log(`  ${cat.icon} ${cat.name}: ${serviceCount} services`)
      })
    }

    console.log('\n🎉 Database reset completed successfully!')
    console.log('📱 Your app is now ready with insurance and telecom services')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
if (require.main === module) {
  resetDatabase()
}

module.exports = { resetDatabase }