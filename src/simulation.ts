export type Parameters={visitorsPerHour:number;modules:number;stepsPerVisitor:number;joulesPerStep:number;conversionEfficiency:number;electricalLoss:number;storageEfficiency:number;hoursPerDay:number;utilization:number;gridFactor:number;demand:number;storageKWh:number};
export type Results={steps:number;grossKWh:number;dailyKWh:number;usableDailyKWh:number;perModuleKWh:number;averagePowerW:number;avoidedKg:number;unmetWh:number;storageFillPercent:number};
// Starting values are editable illustrative assumptions, not measurements from ECOLUZ TILE or a metro station.
export const initial:Parameters={visitorsPerHour:500,modules:48,stepsPerVisitor:8,joulesPerStep:.08,conversionEfficiency:35,electricalLoss:15,storageEfficiency:85,hoursPerDay:18,utilization:80,gridFactor:.05,demand:200,storageKWh:1};
export function model(p:Parameters):Results{
 const steps=p.visitorsPerHour*p.stepsPerVisitor*p.hoursPerDay;
 const grossKWh=steps*p.joulesPerStep/3_600_000;
 const dailyKWh=grossKWh*(p.conversionEfficiency/100)*(1-p.electricalLoss/100);
 const storedKWh=dailyKWh*(p.storageEfficiency/100);
 const usableDailyKWh=Math.min(storedKWh,p.storageKWh)*(p.utilization/100);
 const usefulForDisplacement=Math.min(usableDailyKWh,p.demand/1000);
 return {steps,grossKWh,dailyKWh,usableDailyKWh,perModuleKWh:dailyKWh/p.modules,averagePowerW:dailyKWh*1000/24,avoidedKg:usefulForDisplacement*p.gridFactor*365,unmetWh:Math.max(0,p.demand-usableDailyKWh*1000),storageFillPercent:Math.min(100,storedKWh/p.storageKWh*100)};
}
