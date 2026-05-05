import Visit, { IVisit } from '../models/Visit';
import Lead from '../models/Lead';
import BlogPost from '../models/BlogPost';

class AnalyticsService {
  async recordVisit(data: {
    page: string;
    path: string;
    userAgent?: string;
    referrer?: string;
    ip?: string;
  }): Promise<IVisit> {
    const visit = new Visit({
      page: data.page,
      path: data.path,
      userAgent: data.userAgent || null,
      referrer: data.referrer || null,
      ip: data.ip || null,
    });

    await visit.save();
    return visit;
  }

  async getVisitsByDateRange(days: number = 14): Promise<
    Array<{ date: string; visits: number; leads: number }>
  > {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const visits = await Visit.find({
      timestamp: { $gte: startDate },
    }).sort({ timestamp: 1 });

    const leads = await Lead.find({
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 });

    // Group by date
    const visitsByDate = new Map<string, { visits: number; leads: number }>();

    // Initialize all days
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      visitsByDate.set(dateStr, { visits: 0, leads: 0 });
    }

    // Count visits per day
    visits.forEach((visit) => {
      const dateStr = visit.timestamp.toISOString().split('T')[0];
      const dayData = visitsByDate.get(dateStr);
      if (dayData) {
        dayData.visits++;
      }
    });

    // Count leads per day
    leads.forEach((lead) => {
      const dateStr = lead.createdAt.toISOString().split('T')[0];
      const dayData = visitsByDate.get(dateStr);
      if (dayData) {
        dayData.leads++;
      }
    });

    // Convert to array and format
    return Array.from(visitsByDate.entries())
      .map(([date, data]) => ({
        date,
        visits: data.visits,
        leads: data.leads,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getTotalVisits(days: number = 30): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await Visit.countDocuments({
      timestamp: { $gte: startDate },
    });
  }

  async getTopPages(limit: number = 10): Promise<
    Array<{ page: string; path: string; visits: number }>
  > {
    const visits = await Visit.aggregate([
      {
        $group: {
          _id: { page: '$page', path: '$path' },
          visits: { $sum: 1 },
        },
      },
      { $sort: { visits: -1 } },
      { $limit: limit },
    ]);

    return visits.map((v: any) => ({
      page: v._id.page,
      path: v._id.path,
      visits: v.visits,
    }));
  }

  async getDashboardMetrics(days: number = 30): Promise<{
    totalVisits: number;
    totalLeads: number;
    conversionRate: number;
    topPages: Array<{ page: string; path: string; visits: number }>;
    leadsByStatus: Array<{ status: string; count: number }>;
    visitsByDay: Array<{ date: string; visits: number; leads: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [totalVisits, totalLeads, topPages, leadsByStatus, visitsByDay] = await Promise.all([
      Visit.countDocuments({ timestamp: { $gte: startDate } }),
      Lead.countDocuments({ createdAt: { $gte: startDate } }),
      this.getTopPages(5),
      Lead.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.getVisitsByDateRange(Math.min(days, 14)),
    ]);

    const conversionRate = totalVisits > 0 ? (totalLeads / totalVisits) * 100 : 0;

    return {
      totalVisits,
      totalLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      topPages,
      leadsByStatus: leadsByStatus.map((l: any) => ({ status: l._id, count: l.count })),
      visitsByDay,
    };
  }

  async getLeadsByStatus(days: number = 30): Promise<Array<{ status: string; count: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await Lead.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return result.map((l: any) => ({ status: l._id, count: l.count }));
  }

  async getPipelineValue(): Promise<{ active: number; won: number; lost: number }> {
    const leads = await Lead.find();

    const active = leads
      .filter((l) => !['perdido', 'cerrado'].includes(l.status))
      .reduce((sum, l) => sum + (l.value || 0), 0);

    const won = leads
      .filter((l) => l.status === 'cerrado')
      .reduce((sum, l) => sum + (l.value || 0), 0);

    const lost = leads
      .filter((l) => l.status === 'perdido')
      .reduce((sum, l) => sum + (l.value || 0), 0);

    return { active, won, lost };
  }

  async getTopBlogPosts(limit: number = 5): Promise<Array<{ title: string; views: number; slug: string }>> {
    const posts = await BlogPost.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(limit)
      .select('title views slug');

    return posts.map((p) => ({
      title: p.title,
      views: p.views || 0,
      slug: p.slug,
    }));
  }

  async getReferrers(days: number = 30, limit: number = 10): Promise<Array<{ referrer: string; count: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await Visit.aggregate([
      { $match: { timestamp: { $gte: startDate }, referrer: { $ne: null, $ne: '' } } },
      {
        $group: {
          _id: '$referrer',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return result.map((r: any) => ({ referrer: r._id, count: r.count }));
  }
}

export default new AnalyticsService();
