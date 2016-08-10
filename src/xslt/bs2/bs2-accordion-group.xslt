<?xml version="1.0" encoding="UTF-8"?>
<!--
@Author: Colin Osterhout <ctosterhout>
@Date:   2016-08-09T15:22:46-08:00
@Email:  ctosterhout@alaska.edu
@Project: BERT
@Last modified by:   ctosterhout
@Last modified time: 2016-08-09T16:45:11-08:00
@License: Released under MIT License. Copyright 2016 University of Alaska Southeast.  For more details, see https://opensource.org/licenses/MIT
-->

<xsl:stylesheet
                version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xd="http://www.pnp-software.com/XSLTdoc"
                xmlns:exsl="http://exslt.org/common"
                exclude-result-prefixes="xd exsl"
                >
    <xsl:import href='../include/string.xslt'/>
    <xsl:strip-space elements="*"/>
    <xsl:output method="html" indent='yes' omit-xml-declaration='yes'/>

    <!-- Wrap the entire structure in a div.accordion element -->
    <xd:doc>
        <xd:short>accordion</xd:short>
        <xd:detail>
            <p>Named template to create a Bootstrap 2 accordion widget based on the passed in set of accordion descriptors.</p>
            <p>The accordion descriptor node-set should look like:</p>
            &lt;accordion&gt;
                &lt;accordion-item&gt;
                    &lt;title&gt;
                        This is the title of the accordion section.
                    &lt;/title&gt;
                    &lt;body&gt;
                        &lt;p&gt;This may contain any valid HTML and will be used as the body of the accordion&lt;/p&gt;
                    &lt;/body&gt;
                    &lt;open&gt;false&lt;/open&gt;
                &lt;/accordion-item&gt;
            &lt;/accordion-group&gt;
        </xd:detail>
        <xd:param name="nsAccordionGroup" type="node-set">Set of accordion-item nodes to display</xd:param>
    </xd:doc>
    <xsl:template name="accordion">
        <xsl:param name="nsAccordionGroup"/>
        <!-- Generate a unique ID for use in the accordion top-level div -->
        <xsl:variable name="idAccordion">
            <xsl:for-each select="$nsAccordionGroup">
                <xsl:value-of select="generate-id()"/>
            </xsl:for-each>
        </xsl:variable>

        <div class="accordion">
            <xsl:attribute name='id'><xsl:value-of select="$idAccordion"/></xsl:attribute>
            <xsl:apply-templates select="$nsAccordionGroup/accordion/accordion-item">
                <xsl:with-param name="accordion_id" select="$idAccordion"/>
            </xsl:apply-templates>
        </div>
    </xsl:template>

    <xd:doc>
        Each accordion group div has one or more accordion
    </xd:doc>
    <xsl:template match="accordion-item">
        <xsl:param name="accordion_id"/>
        <!-- Build the class string based on the open / close value -->
        <xsl:variable name="rtfClassBody">
            <node>accordion-body</node>
            <node>collapse</node>
            <xsl:choose>
                <xsl:when test="open='true'">
                    <node>in</node>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="sClassBody">
            <xsl:call-template name="nodeset-join">
                <xsl:with-param name="ns" select="exsl:node-set($rtfClassBody)/*"/>
                <xsl:with-param name="glue" select="' '"/>
            </xsl:call-template>
        </xsl:variable>

        <!-- Each div.accordion-group consists of a div.accordion-heading followed
            by a div.accordion-inner -->
        <div class="accordion-group">
            <!-- Create the heading -->
            <div class="accordion-heading">
                <a class="accordion-toggle" data-toggle="collapse">
                    <xsl:attribute name="data-parent">#<xsl:value-of select="$accordion_id"/></xsl:attribute>
                    <xsl:attribute name="href"><xsl:value-of select="concat('#', generate-id())"/></xsl:attribute>
                    <xsl:value-of select="title"/>
                </a>
            </div>

            <!-- Now create the body of the accordion -->
            <div class="{$sClassBody}">
                <xsl:attribute name='id'><xsl:value-of select="generate-id()"/></xsl:attribute>
                <div class="accordion-inner">
                    <xsl:call-template name="paragraph-wrap">
                        <xsl:with-param name="nodeToWrap" select="body"/>
                    </xsl:call-template>
                </div>
            </div>
        </div>
    </xsl:template>
</xsl:stylesheet>
