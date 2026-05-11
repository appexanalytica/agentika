import { Response } from 'express';
import MediaAsset from '../models/MediaAsset.js';
import MediaService from '../services/MediaService.js';
import { getPaginationParams } from '../utils/helpers.js';
import type { AuthenticatedRequest, PaginatedResponse, SuccessResponse, ErrorResponse } from '../types/index.js';

export const getMediaAssets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip, sort } = getPaginationParams(req.query);
    const { usageType, uploadedBy } = req.query;

    const filter: any = {};
    if (usageType) filter.usageType = usageType;
    if (uploadedBy) filter.uploadedBy = uploadedBy;

    const assets = await MediaAsset.find(filter)
      .populate('uploadedBy', 'username firstName lastName')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await MediaAsset.countDocuments(filter);

    res.json({
      success: true,
      data: assets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    } as PaginatedResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching media assets',
    } as ErrorResponse);
  }
};

export const getMediaById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const asset = await MediaAsset.findById(req.params.id).populate('uploadedBy', 'username firstName lastName');
    if (!asset) {
      res.status(404).json({
        success: false,
        message: 'Media asset not found',
      } as ErrorResponse);
      return;
    }

    res.json({
      success: true,
      data: asset,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching media asset',
    } as ErrorResponse);
  }
};

export const uploadMedia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded',
      } as ErrorResponse);
      return;
    }

    const { usageType, relatedToType, relatedToId } = req.body;

    const asset = await MediaService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      req.user!._id,
      usageType || 'general',
      relatedToType,
      relatedToId
    );

    res.status(201).json({
      success: true,
      data: asset,
    } as SuccessResponse<any>);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error uploading file',
    } as ErrorResponse);
  }
};

export const deleteMedia = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await MediaService.deleteFile(req.params.id as any, req.user!._id);

    res.json({
      success: true,
      message: 'Media deleted successfully',
    } as SuccessResponse<null>);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error deleting media',
    } as ErrorResponse);
  }
};

export const getPresignedUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const url = await MediaService.getPresignedUrl(req.params.id as any);

    res.json({
      success: true,
      data: { url },
    } as SuccessResponse<any>);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Error generating presigned URL',
    } as ErrorResponse);
  }
};

export const getMyFiles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const assets = await MediaAsset.find({ uploadedBy: req.user!._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: assets,
    } as SuccessResponse<any>);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your files',
    } as ErrorResponse);
  }
};
