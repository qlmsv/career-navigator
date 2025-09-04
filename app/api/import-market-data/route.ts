import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { professionSkillRequirements, regionalSalaryData } = body;

    if (!professionSkillRequirements && !regionalSalaryData) {
      return NextResponse.json({ success: false, error: 'No data provided for import.' }, { status: 400 });
    }

    const importResults: { table: string; success: boolean; count?: number; error?: string }[] = [];

    // Import profession_skill_requirements
    if (professionSkillRequirements && professionSkillRequirements.length > 0) {
      const { data, error } = await supabase
        .from('profession_skill_requirements')
        .insert(professionSkillRequirements);

      if (error) {
        importResults.push({ table: 'profession_skill_requirements', success: false, error: error.message });
      } else {
        importResults.push({ table: 'profession_skill_requirements', success: true, count: professionSkillRequirements.length });
      }
    }

    // Import regional_salary_data
    if (regionalSalaryData && regionalSalaryData.length > 0) {
      const { data, error } = await supabase
        .from('regional_salary_data')
        .insert(regionalSalaryData);

      if (error) {
        importResults.push({ table: 'regional_salary_data', success: false, error: error.message });
      } else {
        importResults.push({ table: 'regional_salary_data', success: true, count: regionalSalaryData.length });
      }
    }

    const allSuccess = importResults.every(result => result.success);

    if (allSuccess) {
      return NextResponse.json({ success: true, message: 'Market data imported successfully.', results: importResults });
    } else {
      return NextResponse.json({ success: false, message: 'Some data failed to import.', results: importResults }, { status: 500 });
    }

  } catch (error) {
    console.error('API: Error importing market data:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}