<?xml version="1.0" encoding="UTF-8"?>

<!--
@Author: Colin Osterhout <ctosterhout>
@Date:   2016-03-31T11:42:24-08:00
@Email:  ctosterhout@alaska.edu
@Project: BERT
@Last modified by:   ctosterhout
@Last modified time: 2016-06-01T23:13:57-08:00
@License: Released under MIT License. Copyright 2016 University of Alaska Southeast.  For more details, see https://opensource.org/licenses/MIT
-->

<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xd="http://www.pnp-software.com/XSLTdoc"
    exclude-result-prefixes="xd"
    >

    <xsl:import href="../include/pathfilter.xslt"/>

    <xd:doc type="stylesheet">
        <xd:short>Filter map XML data for easier processing
        can be processed by JavaScript to display a map.</xd:short>
        <xd:detail>
            <p>Inputs XML from a structured data definition from the CMS and
            writes a &lt;div&gt; element with the necessary attributes and classes
            in order to be processed after page load time via a JavaScript
            component.</p>
            <p>The finished HTML should look like:
                <pre>
                    &lt;div
                        data-map-src=&quot;some/path/to/map-data.xml&quot;
                        data-map-show=&quot;map-marker-id&quot;
                        data-map-type=&quot;hybrid&quot;
                        class=&quot;mapdisplay&quot;&gt;
                        Loading map data...
                    &lt;/div&gt;
                </pre>
            </p>
            <p>The JavaScript component should hook on the "mapdisplay" class
            in order to generate a list of elements to process.</p>
        </xd:detail>
        <xd:author>Colin Osterhout (ctoterhout@alaska.edu)</xd:author>
        <xd:copyright>University of Alaska Southeast, 2016</xd:copyright>
    </xd:doc>

    <xsl:strip-space elements="*"/>
    <xsl:output
          method='xml'
          indent='yes'
          omit-xml-declaration='no'
          />

    <xd:doc>
        Set this to be the base URL of the UAS website for icon and image URL
        resolution if external.
    </xd:doc>
    <xsl:param name="sUrlBase">http://uas.alaska.edu</xsl:param>

    <xd:doc>
        Identity transform to cover vast majority of elements in data.
    </xd:doc>
    <xsl:template match="@*|node()">
        <xsl:copy>
            <xsl:apply-templates select="@*|node()"/>
        </xsl:copy>
    </xsl:template>

    <xd:doc>
        <xd:short>Template which matches map data definition and filters elements
            to remove unnecessary information.</xd:short>
        <xd:detail>
            <p>The CMS outputs much unnecessary data for linked-to assets.
            This template filters the image and icon elements in particular to
            just output the path (if present).</p>
        </xd:detail>
    </xd:doc>
    <xsl:template match="point/image | point/icon">
        <xsl:if test="(attribute::type = 'file') and not(normalize-space(path) = '/')">
            <!-- Generate URL string for this image -->
            <xsl:variable name="sUrl">
                <xsl:variable name="sPath">
                    <xsl:call-template name="pathfilter">
                        <xsl:with-param name="path" select="normalize-space(path)"/>
                    </xsl:call-template>
                </xsl:variable>

                <!-- Prepend the base URL string -->
                <xsl:value-of select="concat($sUrlBase, $sPath)"/>
            </xsl:variable>

            <!-- Output element with URL -->
            <xsl:element name="{name()}"><xsl:value-of select="$sUrl"/></xsl:element>
        </xsl:if>
    </xsl:template>
</xsl:stylesheet>
