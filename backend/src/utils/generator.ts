import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateSyntheticRecords(batchId: string, count: number = 50, surveyName: string = 'PLFS') {
  const stateList = [
    { code: '07', name: 'Delhi', dists: ['01', '02', '03', '04'] },
    { code: '27', name: 'Maharashtra', dists: ['01', '12', '21', '33'] },
    { code: '19', name: 'West Bengal', dists: ['03', '08', '14', '22'] },
    { code: '33', name: 'Tamil Nadu', dists: ['02', '09', '18', '24'] },
    { code: '09', name: 'Uttar Pradesh', dists: ['05', '11', '28', '42'] },
    { code: '29', name: 'Karnataka', dists: ['01', '15', '20', '26'] },
  ];

  const enumerators = ['ENUM_1042', 'ENUM_1088', 'ENUM_2019', 'ENUM_3044', 'ENUM_4102', 'ENUM_5199', 'ENUM_6021'];
  const records = [];
  const random = () => Math.random();

  const baseTimestamp = Date.now();

  for (let i = 0; i < count; i++) {
    const st = stateList[Math.floor(random() * stateList.length)];
    const dist = st.dists[Math.floor(random() * st.dists.length)];
    const sector = random() > 0.45 ? 'urban' : 'rural';
    const enumerator = enumerators[Math.floor(random() * enumerators.length)];
    const hhSize = Math.floor(random() * 7) + 1;

    let incTot = Math.round((15000 + random() * 65000) * (sector === 'urban' ? 1.35 : 0.95) * (hhSize * 0.4 + 0.6));
    let hceTot = Math.round(incTot * (0.45 + random() * 0.35));
    let responseCode = random() > 0.85 ? [2, 3, 4][Math.floor(random() * 3)] : 1;

    // Inject occasional anomaly
    const isAnomaly = random() < 0.15;
    let anomalyTag = 'normal';
    if (isAnomaly) {
      const roll = random();
      if (roll < 0.35) {
        hceTot = incTot * (3.1 + random() * 2.0);
        anomalyTag = 'expenditure_spike';
      } else if (roll < 0.65) {
        incTot = random() < 0.5 ? -2000 : 0;
        hceTot = Math.round(20000 + random() * 35000);
        anomalyTag = 'negative_income';
      } else {
        hceTot = Math.round(270000 + random() * 80000);
        anomalyTag = 'super_high_exp';
      }
    }

    const day = String(Math.floor(random() * 27) + 1).padStart(2, '0');
    const surDate = `2024-04-${day}`;

    const rec = await prisma.surveyRecord.create({
      data: {
        batchId,
        fileId: `${surveyName}_GEN_${baseTimestamp % 10000}_${i + 1}`,
        stateCode: st.code,
        districtCode: dist,
        hhSize,
        hceTot: Math.round(hceTot),
        incTot: Math.round(incTot),
        sector,
        enumeratorId: enumerator,
        responseCode,
        surDate,
        extraJson: JSON.stringify({
          stateName: st.name,
          psuId: `PSU_${st.code}_${dist}_${Math.floor(random() * 89) + 10}`,
          landOwnedHa: parseFloat((random() * 2.5).toFixed(2)),
          anomalyTag,
        }),
      },
    });
    records.push(rec);
  }

  // Update batch record count
  await prisma.surveyBatch.update({
    where: { id: batchId },
    data: { recordCount: { increment: records.length } },
  });

  return records;
}
