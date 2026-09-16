import type { StyleTemplate, PresetPrompt } from '../types'

export const styleTemplates: StyleTemplate[] = [
    {
        id: 'figurine',
        title: '🍌 桌面手办模型',
        badge: '人气推荐',
        icon: '🧸',
        prompt: 'Using the nano-banana model, create a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base, with no text on the base. The content on the computer screen is the Zbrush modeling process of this figurine. Next to the computer screen is a BANDAI-style toy packaging box printed with the original artwork. The packaging features two-dimensional flat illustrations. Maintain high fidelity and visual consistency with the image.',
        description: '将画面角色转化为精细的 1/7 涂装手办，置于现实工作台与模型包装盒前'
    },
    {
        id: 'fastfood-solitude',
        title: '🍔 深夜食堂的孤寂',
        badge: '剧情叙事',
        icon: '🌃',
        prompt: 'A cinematic scene inside a fast food restaurant at night. Foreground: a lonely table with burgers and fries, and a smartphone shown large and sharp on the table, clearly displaying the uploaded anime/game character image. A hand is reaching for food, symbolizing solitude. Midground: in the blurred background, a couple is sitting together and kiss. One of them is represented as a cosplayer version of the uploaded character: If the uploaded character is humanoid, show accurate cosplay with hairstyle, costume, and signature props. If the uploaded character is non-humanoid (mecha, creature, mascot, etc.), show a gijinka (humanized cosplay interpretation) that carries clear visual cues, costume colors, and props from the reference image (armor pieces, wings, ears, weapon, or iconic accessories). The other person is an ordinary japan human, and they are showing intimate affection (kissing, holding hands, or sharing food). Background: large glass windows, blurred neon city lights outside. Mood: melancholic, bittersweet, ironic, cinematic shallow depth of field. [reference: the uploaded image defines both the smartphone display and the cosplay design, with visible props emphasized]',
        description: '在深夜的快餐店，将你的角色融入充满故事感的孤寂与现实甜蜜对比场景中'
    },
    {
        id: 'claymation',
        title: '🧸 定格粘土人偶化',
        badge: '治愈潮玩',
        icon: '🎨',
        prompt: 'Transform the uploaded image subject into an adorable handcrafted stop-motion claymation character, Aardman Studios and Coraline style. Natural clay fingerprints and tactile modeling textures, soft volumetric rim lighting, miniature tilt-shift macro depth of field, felt and plasticine materials, placed on a wooden craft workbench with mini sculpting tools.',
        description: '将参考图的角色化身手工粘土定格动画人偶，带有真实粘土压痕与微缩景深'
    },
    {
        id: 'ghibli-cel',
        title: '🍃 吉卜力赛璐璐动画',
        badge: '经典动漫',
        icon: '🖌️',
        prompt: 'Redraw the scene and characters in authentic 1990s Studio Ghibli cel animation aesthetic, Hayao Miyazaki style. Hand-painted gouache background scenery, vibrant nostalgic color palette, lush green foliage, expressive hand-drawn line art, gentle summer daylight, nostalgic warm atmosphere, 35mm film grain.',
        description: '以宫崎骏吉卜力手绘水粉画风重绘画面，具有复古赛璐璐与温暖怀旧光影'
    },
    {
        id: 'cyberpunk-neon',
        title: '🕶️ 赛博霓虹机能风',
        badge: '科幻视觉',
        icon: '⚡',
        prompt: 'Re-imagine the subject in an ultra-detailed cyberpunk sci-fi setting. Add subtle cybernetic enhancements, holographic overlays, and functional techwear garments. Rain-slicked Neo-Tokyo alleyway background with dense volumetric neon signs, reflections in puddles, dramatic cinematic edge lighting, Blade Runner aesthetic, photorealistic 8k.',
        description: '机能未来风改造，注入机械义体、全息微光与赛博朋克雨夜霓虹光影'
    },
    {
        id: 'cinematic-film',
        title: '📸 35mm 电影大师写真',
        badge: '真实质感',
        icon: '🎞️',
        prompt: 'Cinematic live-action photorealistic adaptation of the uploaded subject. Shot on Arri Alexa with 35mm anamorphic lens, Kodachrome film color grading, authentic skin texture and fabric weave details, dramatic natural golden hour rim light, soft bokeh, cinematic atmosphere, award-winning movie still.',
        description: '胶片电影感重塑，呈现35mm变形宽银幕镜头的真实质感、胶片颗粒与电影光影'
    }
]

export const presetCategories = [
    { id: 'all', label: '全部灵感', icon: '✨' },
    { id: 'creative', label: '香蕉潮玩', icon: '🍌' },
    { id: 'anime', label: '二次元动漫', icon: '🎨' },
    { id: '3d', label: '3D/盲盒', icon: '🧸' },
    { id: 'scifi', label: '未来科幻', icon: '🚀' },
    { id: 'photo', label: '写实摄影', icon: '📸' },
    { id: 'fantasy', label: '奇幻艺术', icon: '🌌' }
]

export const presetPrompts: PresetPrompt[] = [
    {
        id: 'cyber-banana-bot',
        title: '赛博香蕉机甲战警',
        category: 'creative',
        icon: '🍌',
        badge: '精选爆款',
        prompt: 'A futuristic cybernetic banana mecha warrior robot standing in a rain-drenched cyberpunk alleyway. Sleek metallic yellow titanium plating, exposed glowing cyan optical wires, neon rim lighting reflections, Unreal Engine 5 render, cinematic dynamic angle, ultra-detailed 8k.',
        description: '硬核未来科技与香蕉元素融合的机械战甲，霓虹光晕与金属反光极具视觉张力'
    },
    {
        id: 'banana-hot-air-balloon',
        title: '梦幻香蕉热气球漫游',
        category: 'creative',
        icon: '🎈',
        badge: '童话治愈',
        prompt: 'A whimsical giant golden banana-shaped hot air balloon floating gently over pastel cotton candy clouds at golden hour sunrise. Fluffy clouds, dreamy light rays, warm whimsical palette, cute miniature animal passengers on the wicker basket, fairytale illustration, soft lighting.',
        description: '飘浮在粉彩色晨曦云海中的巨型香蕉热气球，童话绘本质感'
    },
    {
        id: 'ghibli-countryside',
        title: '吉卜力盛夏风之谷',
        category: 'anime',
        icon: '🍃',
        badge: '清新治愈',
        prompt: 'Studio Ghibli aesthetic, a peaceful hillside cottage surrounded by lush wind-blown green meadows and wild blooming summer flowers. Giant fluffy white cumulus clouds in an azure blue sky, nostalgic hand-painted anime background art, Hayao Miyazaki style, warm radiant daylight.',
        description: '盛夏微风掠过绿意盎然的田野山坡，充满治愈与宁静的手绘天空与小屋'
    },
    {
        id: 'cyber-city-rain',
        title: '新东京赛博雨夜',
        category: 'scifi',
        icon: '🌃',
        badge: '高沉浸感',
        prompt: 'Moody panoramic cityscape of Neo-Tokyo in heavy rainfall at night. Towering mega-structures with glowing holographic advertisements, dense flying traffic trails, wet asphalt with neon pink and cyan puddle reflections, atmospheric fog, cinematic Blade Runner aesthetic, 8k resolution.',
        description: '雨夜赛博朋克巨构城市，繁复的全息招牌与湿润街道路面的光影倒影'
    },
    {
        id: 'mini-chef-clay',
        title: '粘土微缩暖阳烘焙坊',
        category: '3d',
        icon: '🧸',
        badge: '萌趣盲盒',
        prompt: 'Cute miniature 3D clay diorama of a happy animal chef baking fresh croissants in a tiny vintage cozy bakery. Warm morning sunlight streaming through the window, flour dust particles in the air, soft clay textures with subtle fingerprints, tilt-shift macro photography, pastel colors.',
        description: '手作粘土定格微缩烘焙房，暖阳斜射与微小道具带来极致温馨'
    },
    {
        id: 'golden-minimalist-banana',
        title: '黑金极简艺术品静物',
        category: 'photo',
        icon: '📸',
        badge: '高端质感',
        prompt: 'High-end luxury commercial still life photography of a pristine golden banana sculpture resting on a matte charcoal obsidian stone pedestal. Sleek dramatic rim lighting, velvety shadows, clean minimalist gallery composition, Hasselblad medium format, ultra-sharp textures, 8k.',
        description: '顶级商业艺术静物大片，哑光黑石与镀金雕塑的优雅质感碰撞'
    },
    {
        id: 'cosmic-nebula-crystal',
        title: '星云深处的水晶空岛',
        category: 'fantasy',
        icon: '🌌',
        badge: '超现实奇观',
        prompt: 'Surreal fantasy concept art of a floating crystalline island drifting across a luminous purple and cyan cosmic nebula. Floating waterfalls transforming into glowing stardust, glowing alien flora, ethereal starlight reflections, mesmerizing fantasy cosmos, digital matte painting, 8k.',
        description: '宇宙星河深处漂浮的发光水晶空岛，星尘瀑布与幽深星云交织'
    },
    {
        id: 'retro-pixel-cafe',
        title: '16位像素怀旧街角咖啡馆',
        category: 'anime',
        icon: '☕',
        badge: '像素怀旧',
        prompt: '16-bit isometric retro pixel art of a cozy corner coffee shop on a quiet rainy afternoon. Steaming mugs on wooden tables, warm interior amber glow, dripping window panes, charming nostalgic pixel details, dithering shading, cozy lofi vibes.',
        description: '宁静雨后的街角像素咖啡馆，暖光氤氲与复古怀旧细节拉满'
    }
]
