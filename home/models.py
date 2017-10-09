from __future__ import absolute_import, unicode_literals

from django.db import models

from wagtail.wagtailcore.models import Page
from wagtail.wagtailcore import blocks
from wagtail.wagtailimages.blocks import ImageChooserBlock
from wagtail.wagtailcore.fields import StreamField, RichTextField
from wagtail.wagtailadmin.edit_handlers import FieldPanel, StreamFieldPanel, RichTextFieldPanel
from wagtail.wagtailimages.edit_handlers import ImageChooserPanel
from wagtail.wagtailimages.models import Image
from wagtail.contrib.settings.models import BaseSetting, register_setting


class RoadmapSection(blocks.StructBlock):
    title = blocks.CharBlock()
    pages = blocks.ListBlock(blocks.PageChooserBlock())
    image = ImageChooserBlock(required=False)

class HomePage(Page):
    mission_statement = models.CharField(max_length=255, blank=True)
    video = models.URLField(max_length=255, blank=True)

    sections = StreamField([
        ('section', RoadmapSection())
    ], blank=True, default=[])

    content_panels = Page.content_panels + [
        FieldPanel('mission_statement', classname='full'),
        FieldPanel('video'),
        StreamFieldPanel('sections'),
    ]

    template = 'roadmap/roadmap/base.html'

    def header_title(self):
        return self.title

@register_setting
class SiteSettings(BaseSetting):
    google_analytics_id = models.CharField(
        max_length=255, help_text='Your Google Analytics ID. Example: UA-12345', blank=True)
    website_header_text = models.CharField(max_length=255, blank=True, help_text='The title of your website')
    website_header_icon = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    website_footer = RichTextField(blank=True)
    website_favicon = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )
    algolia_app_id = models.CharField(max_length=255, help_text='Your Algolia.com App ID', default='')
    algolia_public_key = models.CharField(max_length=255, help_text='Your Algolia.com public key (NOT private key)', default='')

    panels = [
        FieldPanel('website_header_text'),
        ImageChooserPanel('website_header_icon'),
        FieldPanel('google_analytics_id'),
        RichTextFieldPanel('website_footer'),
        ImageChooserPanel('website_favicon'),
        FieldPanel('algolia_app_id'),
        FieldPanel('algolia_public_key'),
    ]

    def favicon(self):
        return Image.objects.get(file='original_images/favicon.ico.png')


