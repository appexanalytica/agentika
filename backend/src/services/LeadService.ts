import Lead, { ILead } from '../models/Lead';

class LeadService {
  async createLead(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message: string;
    source?: string;
  }): Promise<ILead> {
    const lead = new Lead({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      message: data.message,
      source: data.source || 'web',
      status: 'nuevo',
      tags: [],
      notes: [],
    });

    await lead.save();
    return lead;
  }

  async getAllLeads(page: number = 1, limit: number = 10, status?: string): Promise<{
    leads: ILead[];
    total: number;
    pages: number;
  }> {
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      leads,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getLeadById(id: string): Promise<ILead | null> {
    return await Lead.findById(id);
  }

  async updateLead(id: string, data: Partial<ILead>): Promise<ILead | null> {
    return await Lead.findByIdAndUpdate(id, data, { new: true });
  }

  async updateLeadStatus(id: string, status: ILead['status']): Promise<ILead | null> {
    return await Lead.findByIdAndUpdate(id, { status }, { new: true });
  }

  async addLeadNote(id: string, note: { id: string; text: string; author: string }): Promise<ILead | null> {
    return await Lead.findByIdAndUpdate(
      id,
      { $push: { notes: note } },
      { new: true }
    );
  }

  async deleteLead(id: string): Promise<void> {
    await Lead.findByIdAndDelete(id);
  }
}

export default new LeadService();
