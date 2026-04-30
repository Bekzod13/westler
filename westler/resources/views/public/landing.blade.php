<!DOCTYPE html>
<html lang="{{ $lang ?? 'en' }}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{ $site['meta']['title'] ?? 'WESTLER — Industrial Solutions' }}</title>
<meta name="description" content="{{ $site['meta']['description'] ?? '' }}">
<link rel="icon" href="/logo/favicon.ico">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/landing.css">
</head>
<body x-data="{ showContact: false }" x-cloak>

{{-- HEADER --}}
<header class="site-header">
<div class="inner">
<a href="/" class="brand">{{ $site['brand'] ?? 'WESTLER ENGINEERING' }}</a>
<nav class="header-nav">
<a href="#aboutCompany">{{ $site['header']['nav']['about'] ?? 'About' }}</a>
<a href="#capabilities">{{ $site['header']['nav']['capabilities'] ?? 'Capabilities' }}</a>
<a href="#engineering">{{ $site['header']['nav']['engineering'] ?? 'Engineering' }}</a>
<a href="#contact">{{ $site['header']['nav']['contact'] ?? 'Contact' }}</a>
<select class="lang-select" aria-label="{{ $site['header']['languageAria'] ?? 'Language' }}" onchange="location.href='/?lang='+this.value">
@foreach($languages as $l)
<option value="{{ $l['code'] }}" {{ ($lang ?? 'en') === $l['code'] ? 'selected' : '' }}>{{ $l['name'] }}</option>
@endforeach
</select>
<button class="header-cta" @click="showContact=true">{{ $site['header']['discuss'] ?? 'Discuss Your Project' }}</button>
</nav>
</div>
</header>

{{-- HERO --}}
@if($banners->isNotEmpty())
@php $hero = $banners->first(); @endphp
<section class="hero" id="hero">
<div class="hero-bg"><img src="{{ $hero['image'] ?? '/westler/imgSection.jpg' }}" alt=""></div>
<div class="hero-overlay"></div>
<div class="hero-content">
<h1>
@foreach(explode("\n", $hero['title'] ?? '') as $line)
<span>{{ trim($line) }}</span>
@endforeach
</h1>
@if(!empty($hero['subtitle']))
<div class="hero-subtitle">{!! $hero['subtitle'] !!}</div>
@endif
<div class="hero-cta-wrap">
<button class="cta-btn" @click="showContact=true">{{ $hero['button'] ?? 'Start Your Project' }}</button>
</div>
</div>
</section>
@endif

{{-- ABOUT --}}
<section class="about-section" id="aboutCompany">
<div class="container">
<div class="about-grid">
<div class="about-text">
<h2>{{ $site['about']['headingLine1'] ?? 'Industrial Solutions' }}<br>{{ $site['about']['headingLine2'] ?? 'Without Limits' }}</h2>
<p>{{ $site['about']['p1'] ?? '' }}</p>
<p>{{ $site['about']['p2'] ?? '' }}</p>
</div>
<div class="about-img">
<div class="about-img-inner">
<img src="{{ $company['image'] ?? '/westler/imgIndustrialMachineryInspection.jpg' }}" alt="{{ $site['about']['imageAlt'] ?? '' }}">
</div>
</div>
</div>
@if(!empty($site['stats']))
<div class="stats-row">
@foreach($site['stats'] as $s)
<div class="stat-item"><div class="val">{{ $s['value'] }}</div><div class="lbl">{{ $s['label'] }}</div></div>
@endforeach
</div>
@endif
</div>
</section>

{{-- CAPABILITIES --}}
<section class="capabilities-section" id="capabilities">
<div class="container">
<h2 class="section-title">{{ $site['capabilitiesSectionTitle'] ?? 'Our Capabilities' }}</h2>
@if(!empty($site['capabilities']))
<div class="services-grid">
@foreach($site['capabilities'] as $cap)
<div class="service-card">
<div class="card-img">
<img src="{{ $cap['image'] ?? '' }}" alt="{{ $cap['title'] ?? '' }}">
<div class="card-overlay"></div>
<div class="card-content">
<h3>{{ $cap['title'] ?? '' }}</h3>
@if(!empty($cap['body']))<div class="card-body">{{ $cap['body'] }}</div>@endif
</div>
</div>
</div>
@endforeach
</div>
@elseif($services->isNotEmpty())
<div class="services-grid">
@foreach($services as $s)
<div class="service-card">
<div class="card-img">
@if($s['image'])<img src="{{ $s['image'] }}" alt="{{ $s['title'] ?? '' }}">@endif
<div class="card-overlay"></div>
<div class="card-content">
<h3>{{ $s['title'] ?? '' }}</h3>
@if(!empty($s['subtitle']))<div class="card-body">{{ $s['subtitle'] }}</div>@endif
</div>
</div>
</div>
@endforeach
</div>
@endif
</div>
</section>

{{-- SECTORS --}}
@if(!empty($groups['sectors']))
@php $sectorsCards = json_decode($groups['sectors']['strings']['cardsJson'] ?? '[]', true); @endphp
<section class="sectors-section" id="sectors">
<div class="container">
<h2 class="section-title">{{ $groups['sectors']['strings']['sectionTitle'] ?? $site['sectorsSectionTitle'] ?? 'Sectors' }}</h2>
<div class="sectors-grid">
@foreach($sectorsCards as $card)
<article class="sector-card">
<h3>{{ $card['title'] ?? '' }}</h3>
<p>{{ $card['body'] ?? '' }}</p>
</article>
@endforeach
</div>
</div>
</section>
@endif

{{-- ENGINEERING --}}
@if(!empty($groups['engineering']))
@php $engPoints = json_decode($groups['engineering']['strings']['pointsJson'] ?? '[]', true); @endphp
<section class="engineering-section" id="engineering">
<div class="container">
<div class="engineering-grid">
<div>
<h2>{{ $groups['engineering']['strings']['headingLine1'] ?? '' }}<br>{{ $groups['engineering']['strings']['headingLine2'] ?? '' }}</h2>
<ul class="engineering-points">
@foreach($engPoints as $pt)<li>{{ $pt['label'] ?? '' }}</li>@endforeach
</ul>
<button class="engineering-cta" @click="showContact=true">{{ $groups['engineering']['strings']['cta'] ?? 'Request Consultation' }}</button>
</div>
<div class="engineering-img">
<div class="engineering-img-inner">
<img src="/westler/imgEngineeringCadReview.jpg" alt="{{ $groups['engineering']['strings']['imageAlt'] ?? '' }}">
</div>
</div>
</div>
</div>
</section>
@endif

{{-- WHY US --}}
@if(!empty($groups['why-us']))
@php $whyCards = json_decode($groups['why-us']['strings']['cardsJson'] ?? '[]', true); @endphp
<section class="whyus-section">
<div class="container">
<h2 class="section-title">{{ $groups['why-us']['strings']['sectionTitle'] ?? 'Why Choose Us' }}</h2>
<div class="whyus-grid">
@foreach($whyCards as $card)
<div class="whyus-card">
<div class="whyus-icon">
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2e739e" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
</div>
<div>
<h3>{{ $card['title'] ?? '' }}</h3>
<p>{{ $card['body'] ?? '' }}</p>
</div>
</div>
@endforeach
</div>
</div>
</section>
@endif

{{-- PARTNERS --}}
@if($partners->isNotEmpty())
<section class="partners-section">
<div class="container" style="text-align:center">
<h2 class="section-title">{{ $site['partnersSectionTitle'] ?? 'Our Strategic Partners' }}</h2>
<div class="partners-track-wrap">
<div class="partners-track">
@foreach($partners as $p)<div class="partner-tile"><img src="{{ $p['image'] }}" alt="{{ $p['title'] ?? 'Partner' }}"></div>@endforeach
@foreach($partners as $p)<div class="partner-tile"><img src="{{ $p['image'] }}" alt="{{ $p['title'] ?? 'Partner' }}"></div>@endforeach
</div>
</div>
</div>
</section>
@endif

{{-- GLOBAL PRESENCE --}}
@if(!empty($groups['global-presence']))
<section class="presence-section">
<div class="container">
<h2 class="section-title">{{ $groups['global-presence']['strings']['title'] ?? 'Global Presence' }}</h2>
<p>{{ $groups['global-presence']['strings']['body'] ?? '' }}</p>
<div class="presence-map">
<div class="presence-map-inner">
<img src="/westler/map.png" alt="{{ $groups['global-presence']['strings']['mapAlt'] ?? '' }}">
</div>
</div>
</div>
</section>
@endif

{{-- CLOSING CTA --}}
@php $cta = json_decode($groups['footer']['strings']['closingCtaJson'] ?? '{}', true); @endphp
<section class="closing-cta" id="contact">
<div class="closing-cta-inner">
<h2>{{ $cta['headingLine1'] ?? "Let's turn complexity into" }}<br>{{ $cta['headingLine2'] ?? 'performance.' }}</h2>
<button class="closing-cta-btn" @click="showContact=true">{{ $cta['buttonLabel'] ?? '' }}</button>
</div>
</section>

{{-- FOOTER --}}
<footer class="site-footer">
<div class="container">
@php $cols = json_decode($groups['footer']['strings']['columnsJson'] ?? '[]', true); @endphp
<div class="footer-grid">
@foreach($cols as $col)
<div class="footer-col">
<h4>{{ $col['title'] ?? '' }}</h4>
<ul>
@foreach($col['links'] ?? [] as $link)<li><a href="{{ $link['href'] ?? '#' }}">{{ $link['label'] ?? '' }}</a></li>@endforeach
</ul>
</div>
@endforeach
</div>
<div class="footer-bottom">&copy; {{ date('Y') }} {{ $groups['footer']['strings']['copyright'] ?? 'WESTLER ENGINEERING LIMITED' }}</div>
</div>
</footer>

{{-- CONTACT MODAL --}}
<template x-if="showContact">
<div class="contact-backdrop" @keydown.escape.window="showContact=false">
<button class="overlay" @click="showContact=false" aria-label="{{ $site['contactModal']['closeDialogAria'] ?? 'Close' }}"></button>
<div class="contact-modal" x-data="contactForm()" @click.stop>
<template x-if="!sent">
<div>
<div class="modal-header">
<h2>{{ $site['contactModal']['title'] ?? 'Discuss Your Project' }}</h2>
<button class="close-btn" @click="$dispatch('input');showContact=false" aria-label="{{ $site['contactModal']['closeButtonAria'] ?? 'Close' }}">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
</button>
</div>
<form @submit.prevent="submit()">
<div class="field-group"><label>{{ $site['contactModal']['fullName'] ?? 'Full Name' }} <span class="req">*</span></label><input type="text" x-model="fd.fullName" required autocomplete="name"></div>
<div class="field-group"><label>{{ $site['contactModal']['companyName'] ?? 'Company Name' }}</label><input type="text" x-model="fd.companyName" autocomplete="organization"></div>
<div class="field-group"><label>{{ $site['contactModal']['phone'] ?? 'Phone' }} <span class="req">*</span></label><input type="tel" x-model="fd.phone" required autocomplete="tel" placeholder="{{ $site['contactModal']['phonePlaceholder'] ?? '' }}"></div>
<div class="field-group"><label>{{ $site['contactModal']['email'] ?? 'Email' }}</label><input type="email" x-model="fd.email" autocomplete="email"></div>
<div class="field-group"><label>{{ $site['contactModal']['message'] ?? 'Message' }}</label><textarea x-model="fd.message" rows="4"></textarea></div>
<button type="submit" class="submit-btn" :disabled="loading" x-text="loading?'…':'{{ $site['contactModal']['submit'] ?? 'Send Message' }}'"></button>
</form>
</div>
</template>
<template x-if="sent">
<div style="text-align:center;padding:48px 24px">
<div style="font-size:3rem;color:#2e739e;margin-bottom:12px">✓</div>
<p style="color:#67737e">Thank you! We'll be in touch.</p>
<button class="submit-btn" style="margin-top:24px" @click="showContact=false;sent=false">Close</button>
</div>
</template>
</div>
</div>
</template>

<script src="https://cdn.jsdelivr.net/npm/alpinejs@3/dist/cdn.min.js" defer></script>
<script>
function contactForm(){return{fd:{fullName:'',companyName:'',phone:'',email:'',message:''},loading:false,sent:false,
async submit(){this.loading=true;try{
const r=await fetch('/api/public/orders',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(this.fd)});
if(r.ok)this.sent=true;else{const d=await r.json();alert(d.message||'Error');}
}catch(e){alert('Network error');}finally{this.loading=false;}}}}
</script>
<style>[x-cloak]{display:none!important}</style>
</body>
</html>
