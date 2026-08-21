import { HuggingFaceDNA } from "@/types";

export interface HuggingFaceRawData {
  models: any[];
  datasets: any[];
  spaces: any[];
}

export class HuggingFaceEngine {
  /**
   * Fetches user identity from Hugging Face OAuth / whoami API.
   */
  static async fetchUserInfo(accessToken: string): Promise<{
    id: string;
    username: string;
    fullname: string | null;
    avatarUrl: string | null;
  }> {
    const res = await fetch("https://huggingface.co/api/whoami-v2", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "StudentHub-OAuth",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      // Fallback to OAuth userinfo
      const userinfoRes = await fetch("https://huggingface.co/oauth/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "StudentHub-OAuth",
        },
        cache: "no-store",
      });

      if (!userinfoRes.ok) {
        throw new Error("Failed to retrieve authenticated Hugging Face identity.");
      }

      const info = await userinfoRes.json();
      return {
        id: String(info.sub || info.preferred_username || "hf_user"),
        username: info.preferred_username || info.name || "hf_user",
        fullname: info.name || null,
        avatarUrl: info.picture || null,
      };
    }

    const data = await res.json();
    return {
      id: String(data.id || data.name),
      username: data.name,
      fullname: data.fullname || null,
      avatarUrl: data.avatarUrl || null,
    };
  }

  /**
   * Fetches public models, datasets, and spaces for a Hugging Face username using public API endpoints.
   */
  static async fetchUserPublicData(username: string): Promise<HuggingFaceRawData> {
    const headers = { "User-Agent": "StudentHub-OAuth" };

    try {
      const [modelsRes, datasetsRes, spacesRes] = await Promise.all([
        fetch(`https://huggingface.co/api/models?author=${encodeURIComponent(username)}&limit=50&full=true`, { headers, cache: "no-store" }),
        fetch(`https://huggingface.co/api/datasets?author=${encodeURIComponent(username)}&limit=50&full=true`, { headers, cache: "no-store" }),
        fetch(`https://huggingface.co/api/spaces?author=${encodeURIComponent(username)}&limit=50&full=true`, { headers, cache: "no-store" }),
      ]);

      const models = modelsRes.ok ? await modelsRes.json() : [];
      const datasets = datasetsRes.ok ? await datasetsRes.json() : [];
      const spaces = spacesRes.ok ? await spacesRes.json() : [];

      return {
        models: Array.isArray(models) ? models : [],
        datasets: Array.isArray(datasets) ? datasets : [],
        spaces: Array.isArray(spaces) ? spaces : [],
      };
    } catch (err) {
      console.warn(`HuggingFace API fetch warning for ${username}:`, err);
      return { models: [], datasets: [], spaces: [] };
    }
  }

  /**
   * Analyzes Hugging Face repositories (Models, Datasets, Spaces) to generate HuggingFaceDNA and evidence.
   */
  static analyzeData(username: string, rawData: HuggingFaceRawData): HuggingFaceDNA {
    const { models, datasets, spaces } = rawData;

    const modelsCount = models.length;
    const datasetsCount = datasets.length;
    const spacesCount = spaces.length;

    let totalLikes = 0;
    const tagCounts: Record<string, number> = {};
    const frameworkCounts: Record<string, number> = {};
    const evidenceList: HuggingFaceDNA["evidence"] = [];

    // Analyze Models
    models.forEach((m) => {
      totalLikes += m.likes || 0;

      if (m.tags && Array.isArray(m.tags)) {
        m.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }

      const libraryName = m.library_name || "PyTorch";
      frameworkCounts[libraryName] = (frameworkCounts[libraryName] || 0) + 1;

      evidenceList.push({
        id: `ev_hf_model_${m.id || m._id}`,
        entity: m.id || `${username}/model`,
        skill: libraryName === "transformers" ? "Transformers & LLMs" : libraryName,
        text: `Published Hugging Face Model "${m.id}" with ${m.likes || 0} likes (${m.pipeline_tag || "ML model"})`,
        confidence: 90,
        source: "HuggingFace",
      });
    });

    // Analyze Datasets
    datasets.forEach((d) => {
      totalLikes += d.likes || 0;
      evidenceList.push({
        id: `ev_hf_ds_${d.id || d._id}`,
        entity: d.id || `${username}/dataset`,
        skill: "Dataset Engineering",
        text: `Published Hugging Face Dataset "${d.id}" with ${d.likes || 0} likes`,
        confidence: 85,
        source: "HuggingFace",
      });
    });

    // Analyze Spaces
    spaces.forEach((s) => {
      totalLikes += s.likes || 0;
      const sdk = s.sdk || "Gradio / Streamlit";
      evidenceList.push({
        id: `ev_hf_space_${s.id || s._id}`,
        entity: s.id || `${username}/space`,
        skill: `AI App Deployment (${sdk})`,
        text: `Created Interactive Hugging Face Space "${s.id}" (${sdk})`,
        confidence: 90,
        source: "HuggingFace",
      });
    });

    // Identify Top Frameworks
    const topFrameworks = Object.entries(frameworkCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, 5);

    if (topFrameworks.length === 0 && (modelsCount > 0 || spacesCount > 0)) {
      topFrameworks.push("PyTorch", "Transformers");
    }

    // Identify AI Specializations
    const aiSpecializationsSet = new Set<string>();
    if (spacesCount > 0) aiSpecializationsSet.add("Interactive AI Applications");
    if (modelsCount > 0) aiSpecializationsSet.add("Open-Source Model Engineering");
    if (datasetsCount > 0) aiSpecializationsSet.add("Dataset Curation & Fine-Tuning");
    if (Object.keys(tagCounts).some((t) => t.includes("nlp") || t.includes("text"))) {
      aiSpecializationsSet.add("Natural Language Processing");
    }
    if (Object.keys(tagCounts).some((t) => t.includes("vision") || t.includes("image"))) {
      aiSpecializationsSet.add("Computer Vision");
    }

    const aiSpecializations = Array.from(aiSpecializationsSet);
    if (aiSpecializations.length === 0) {
      aiSpecializations.push("Machine Learning & AI Development");
    }

    // Deterministic Hugging Face DNA Score (0 - 100)
    // Models = 20 pts each (max 50), Datasets = 15 pts each (max 30), Spaces = 15 pts each (max 30), Likes bonus (max 20)
    const rawScore =
      modelsCount * 20 +
      datasetsCount * 15 +
      spacesCount * 15 +
      Math.min(totalLikes * 2, 20);

    const totalReposCount = modelsCount + datasetsCount + spacesCount;
    const score = totalReposCount === 0 ? 0 : Math.min(Math.max(rawScore, 50), 98);
    const confidence = totalReposCount > 0 ? 95 : 70;

    return {
      score,
      confidence,
      username,
      modelsCount,
      datasetsCount,
      spacesCount,
      totalLikes,
      topFrameworks,
      aiSpecializations,
      evidence: evidenceList,
    };
  }
}
